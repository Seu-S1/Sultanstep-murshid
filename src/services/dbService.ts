import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';
import {
  ExamAttempt,
  ExamModel,
  MistakeItem,
  Question,
  ReadyStudyPlan,
  StudentUser,
  StudyPlan,
} from '../types';

/**
 * Service for permanent Cloud Firestore database persistence
 */

// 1. User Management
export async function findUserByEmail(email: string): Promise<StudentUser | null> {
  try {
    const cleanEmail = email.trim().toLowerCase();
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '==', cleanEmail));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return userDoc.data() as StudentUser;
    }
    return null;
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }
}

export async function createUser(user: StudentUser): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, {
      ...user,
      email: user.email.trim().toLowerCase(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error creating user in Firestore:', error);
    throw error;
  }
}

export async function updateUser(userId: string, updates: Partial<StudentUser>): Promise<void> {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating user in Firestore:', error);
    throw error;
  }
}

export async function deleteUserAccount(userId: string): Promise<void> {
  try {
    // 1. Delete attempts
    const attemptsRef = collection(db, 'users', userId, 'attempts');
    const attemptsSnap = await getDocs(attemptsRef);
    for (const d of attemptsSnap.docs) {
      await deleteDoc(d.ref);
    }

    // 2. Delete mistakes
    const mistakesRef = collection(db, 'users', userId, 'mistakes');
    const mistakesSnap = await getDocs(mistakesRef);
    for (const d of mistakesSnap.docs) {
      await deleteDoc(d.ref);
    }

    // 3. Delete study plans
    const plansRef = collection(db, 'users', userId, 'studyPlans');
    const plansSnap = await getDocs(plansRef);
    for (const d of plansSnap.docs) {
      await deleteDoc(d.ref);
    }

    // 4. Delete user document
    await deleteDoc(doc(db, 'users', userId));
  } catch (error) {
    console.error('Error deleting user account:', error);
    throw error;
  }
}

export async function loadAllStudentsFromDb(): Promise<StudentUser[]> {
  try {
    const usersRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersRef);
    const students: StudentUser[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data() as StudentUser;
      if (data.role === 'student' || (!data.role && !data.email?.toLowerCase().includes('admin'))) {
        students.push({
          ...data,
          id: docSnap.id,
          status: data.status || 'active',
        });
      }
    });
    // Sort descending by registration/active date
    students.sort(
      (a, b) =>
        new Date(b.joinedDate || b.lastActiveDate || 0).getTime() -
        new Date(a.joinedDate || a.lastActiveDate || 0).getTime()
    );
    return students;
  } catch (error) {
    console.error('Error loading students from Firestore:', error);
    throw error;
  }
}

export async function batchSaveStudents(
  students: StudentUser[],
  updateExisting: boolean = true
): Promise<{ added: number; updated: number; skipped: number }> {
  try {
    let added = 0;
    let updated = 0;
    let skipped = 0;

    // Process in chunks of 450 to respect Firestore batch limit of 500
    const chunkSize = 450;
    for (let i = 0; i < students.length; i += chunkSize) {
      const chunk = students.slice(i, i + chunkSize);
      const batch = writeBatch(db);

      for (const s of chunk) {
        const cleanEmail = s.email.trim().toLowerCase();
        const existing = await findUserByEmail(cleanEmail);

        if (existing) {
          if (updateExisting) {
            const docRef = doc(db, 'users', existing.id);
            batch.update(docRef, {
              name: s.name || existing.name,
              targetScore: s.targetScore ?? existing.targetScore ?? 85,
              status: s.status || existing.status || 'active',
              updatedAt: new Date().toISOString(),
            });
            updated++;
          } else {
            skipped++;
          }
        } else {
          const newId = s.id || `usr-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
          const docRef = doc(db, 'users', newId);
          batch.set(docRef, {
            ...s,
            id: newId,
            email: cleanEmail,
            role: 'student',
            status: s.status || 'active',
            avatar: '🎓',
            joinedDate: s.joinedDate || new Date().toISOString().split('T')[0],
            studyStreak: s.studyStreak ?? 0,
            lastActiveDate: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
          added++;
        }
      }

      await batch.commit();
    }

    return { added, updated, skipped };
  } catch (error) {
    console.error('Error in batchSaveStudents:', error);
    throw error;
  }
}

export async function loadStudentFullStats(userId: string): Promise<{
  attempts: ExamAttempt[];
  mistakes: MistakeItem[];
  studyPlan: StudyPlan | null;
}> {
  try {
    const [attempts, mistakes, studyPlan] = await Promise.all([
      loadUserAttempts(userId),
      loadUserMistakes(userId),
      loadUserStudyPlan(userId),
    ]);
    return { attempts, mistakes, studyPlan };
  } catch (error) {
    console.error('Error loading student full stats:', error);
    throw error;
  }
}

// 2. Exam Attempts
export async function loadUserAttempts(userId: string): Promise<ExamAttempt[]> {
  try {
    const attemptsRef = collection(db, 'users', userId, 'attempts');
    const snapshot = await getDocs(attemptsRef);
    const attempts: ExamAttempt[] = [];
    snapshot.forEach((doc) => {
      attempts.push(doc.data() as ExamAttempt);
    });
    // Sort chronologically ascending
    attempts.sort((a, b) => new Date(a.startedAt).getTime() - new Date(b.startedAt).getTime());
    return attempts;
  } catch (error) {
    console.error('Error loading attempts from Firestore:', error);
    throw error;
  }
}

export async function saveAttempt(userId: string, attempt: ExamAttempt): Promise<void> {
  try {
    const attemptRef = doc(db, 'users', userId, 'attempts', attempt.id);
    await setDoc(attemptRef, {
      ...attempt,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error saving attempt in Firestore:', error);
    throw error;
  }
}

// 3. Mistakes Bank
export async function loadUserMistakes(userId: string): Promise<MistakeItem[]> {
  try {
    const mistakesRef = collection(db, 'users', userId, 'mistakes');
    const snapshot = await getDocs(mistakesRef);
    const mistakes: MistakeItem[] = [];
    snapshot.forEach((doc) => {
      mistakes.push(doc.data() as MistakeItem);
    });
    return mistakes;
  } catch (error) {
    console.error('Error loading mistakes from Firestore:', error);
    throw error;
  }
}

export async function saveMistake(userId: string, mistake: MistakeItem): Promise<void> {
  try {
    const mistakeRef = doc(db, 'users', userId, 'mistakes', mistake.id);
    await setDoc(mistakeRef, {
      ...mistake,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error saving mistake in Firestore:', error);
    throw error;
  }
}

export async function deleteMistake(userId: string, mistakeId: string): Promise<void> {
  try {
    const mistakeRef = doc(db, 'users', userId, 'mistakes', mistakeId);
    await deleteDoc(mistakeRef);
  } catch (error) {
    console.error('Error deleting mistake in Firestore:', error);
    throw error;
  }
}

// 4. Study Plans
export async function loadUserStudyPlan(userId: string): Promise<StudyPlan | null> {
  try {
    const planRef = doc(db, 'users', userId, 'studyPlans', 'active');
    const snap = await getDoc(planRef);
    if (snap.exists()) {
      return snap.data() as StudyPlan;
    }
    return null;
  } catch (error) {
    console.error('Error loading study plan from Firestore:', error);
    throw error;
  }
}

export async function saveUserStudyPlan(userId: string, plan: StudyPlan): Promise<void> {
  try {
    const planRef = doc(db, 'users', userId, 'studyPlans', 'active');
    await setDoc(planRef, {
      ...plan,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error saving study plan in Firestore:', error);
    throw error;
  }
}

// 5. Ready-Made Study Plans (Admin published)
export async function loadReadyPlans(): Promise<ReadyStudyPlan[]> {
  try {
    const plansRef = collection(db, 'readyPlans');
    const snap = await getDocs(plansRef);
    const plans: ReadyStudyPlan[] = [];
    snap.forEach((doc) => {
      plans.push(doc.data() as ReadyStudyPlan);
    });
    return plans;
  } catch (error) {
    console.error('Error loading ready plans from Firestore:', error);
    return [];
  }
}

export async function saveReadyPlan(plan: ReadyStudyPlan): Promise<void> {
  try {
    const planRef = doc(db, 'readyPlans', plan.id);
    await setDoc(planRef, plan);
  } catch (error) {
    console.error('Error saving ready plan in Firestore:', error);
    throw error;
  }
}

export async function deleteReadyPlan(planId: string): Promise<void> {
  try {
    const planRef = doc(db, 'readyPlans', planId);
    await deleteDoc(planRef);
  } catch (error) {
    console.error('Error deleting ready plan from Firestore:', error);
    throw error;
  }
}

// 6. Questions Bank (Permanent Firestore storage with batch processing)
export async function loadQuestionsFromDb(): Promise<Question[]> {
  try {
    const questionsRef = collection(db, 'questions');
    const snap = await getDocs(questionsRef);
    const questionsList: Question[] = [];
    snap.forEach((d) => {
      questionsList.push(d.data() as Question);
    });
    return questionsList;
  } catch (error) {
    console.warn('Error loading questions from Firestore:', error);
    return [];
  }
}

export async function saveQuestionToDb(q: Question): Promise<void> {
  try {
    const qRef = doc(db, 'questions', q.id);
    await setDoc(qRef, {
      ...q,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error saving question to Firestore:', error);
    throw error;
  }
}

export async function deleteQuestionFromDb(questionId: string): Promise<void> {
  try {
    const qRef = doc(db, 'questions', questionId);
    await deleteDoc(qRef);
  } catch (error) {
    console.error('Error deleting question from Firestore:', error);
    throw error;
  }
}

export async function saveQuestionsBatch(
  questionsList: Question[],
  onProgress?: (saved: number, total: number) => void
): Promise<void> {
  if (questionsList.length === 0) return;

  const CHUNK_SIZE = 100;
  const total = questionsList.length;
  let savedCount = 0;

  for (let i = 0; i < total; i += CHUNK_SIZE) {
    const chunk = questionsList.slice(i, i + CHUNK_SIZE);
    const batch = writeBatch(db);

    for (const q of chunk) {
      const qRef = doc(db, 'questions', q.id);
      batch.set(qRef, {
        ...q,
        updatedAt: new Date().toISOString(),
      });
    }

    await batch.commit();
    savedCount += chunk.length;
    if (onProgress) {
      onProgress(savedCount, total);
    }
  }
}

// 7. Exam Models (Permanent Firestore storage)
export async function loadModelsFromDb(): Promise<ExamModel[]> {
  try {
    const modelsRef = collection(db, 'models');
    const snap = await getDocs(modelsRef);
    const modelsList: ExamModel[] = [];
    snap.forEach((d) => {
      modelsList.push(d.data() as ExamModel);
    });
    modelsList.sort((a, b) => b.number - a.number);
    return modelsList;
  } catch (error) {
    console.warn('Error loading models from Firestore:', error);
    return [];
  }
}

export async function saveModelToDb(model: ExamModel): Promise<void> {
  try {
    const mRef = doc(db, 'models', model.id);
    await setDoc(mRef, {
      ...model,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error saving model to Firestore:', error);
    throw error;
  }
}

export async function deleteModelFromDb(modelId: string): Promise<void> {
  try {
    const mRef = doc(db, 'models', modelId);
    await deleteDoc(mRef);
  } catch (error) {
    console.error('Error deleting model from Firestore:', error);
    throw error;
  }
}

// 8. Admin Users Persistence in Firestore
export async function loadAdminsFromDb(): Promise<import('../types').AdminUser[]> {
  try {
    const adminsRef = collection(db, 'admins');
    const snap = await getDocs(adminsRef);
    const adminsList: import('../types').AdminUser[] = [];
    snap.forEach((d) => {
      adminsList.push(d.data() as import('../types').AdminUser);
    });
    return adminsList;
  } catch (error) {
    console.warn('Error loading admins from Firestore:', error);
    return [];
  }
}

export async function saveAdminToDb(adminUser: import('../types').AdminUser): Promise<void> {
  try {
    const aRef = doc(db, 'admins', adminUser.id);
    await setDoc(aRef, {
      ...adminUser,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error saving admin to Firestore:', error);
    throw error;
  }
}

export async function deleteAdminFromDb(adminId: string): Promise<void> {
  try {
    const aRef = doc(db, 'admins', adminId);
    await deleteDoc(aRef);
  } catch (error) {
    console.error('Error deleting admin from Firestore:', error);
    throw error;
  }
}

// 9. Activity Logs Persistence in Firestore
export async function loadActivityLogsFromDb(): Promise<import('../types').ActivityLogItem[]> {
  try {
    const logsRef = collection(db, 'activityLogs');
    const snap = await getDocs(logsRef);
    const logsList: import('../types').ActivityLogItem[] = [];
    snap.forEach((d) => {
      logsList.push(d.data() as import('../types').ActivityLogItem);
    });
    // Sort descending by id or timestamp
    logsList.sort((a, b) => b.id.localeCompare(a.id));
    return logsList;
  } catch (error) {
    console.warn('Error loading activity logs from Firestore:', error);
    return [];
  }
}

export async function saveActivityLogToDb(logItem: import('../types').ActivityLogItem): Promise<void> {
  try {
    const lRef = doc(db, 'activityLogs', logItem.id);
    await setDoc(lRef, logItem);
  } catch (error) {
    console.error('Error saving activity log to Firestore:', error);
  }
}
