import React, { useState, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import { useApp } from '../../context/AppContext';
import { StudentUser, ExamAttempt, MistakeItem, StudyPlan } from '../../types';
import {
  GraduationCap,
  Search,
  Plus,
  Edit3,
  Trash2,
  UserCheck,
  UserX,
  FileSpreadsheet,
  Download,
  Upload,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  AlertCircle,
  X,
  Clock,
  Award,
  BookOpen,
  Calendar,
  Phone,
  Mail,
  Filter,
  Check,
  Loader2,
  Sparkles,
} from 'lucide-react';

export const StudentManagementSection: React.FC = () => {
  const {
    students,
    isLoadingStudents,
    loadStudents,
    addStudent,
    updateStudent,
    toggleStudentStatus,
    deleteStudent,
    batchImportStudents,
    getStudentDetails,
  } = useApp();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');
  const [sortBy, setSortBy] = useState<'joined' | 'name' | 'target'>('joined');

  // Modal States
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formTargetScore, setFormTargetScore] = useState<number>(85);
  const [formStatus, setFormStatus] = useState<'active' | 'disabled'>('active');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Student Details Modal State
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedStudentDetails, setSelectedStudentDetails] = useState<{
    student: StudentUser | null;
    attempts: ExamAttempt[];
    mistakes: MistakeItem[];
    studyPlan: StudyPlan | null;
  } | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Delete Confirmation State
  const [deleteConfirmStudent, setDeleteConfirmStudent] = useState<StudentUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Batch Import State
  const [isBatchImportOpen, setIsBatchImportOpen] = useState(false);
  const [batchParsedData, setBatchParsedData] = useState<
    Array<{ name: string; email: string; targetScore?: number; phone?: string; status?: 'active' | 'disabled' }>
  >([]);
  const [batchFileName, setBatchFileName] = useState<string | null>(null);
  const [batchImportError, setBatchImportError] = useState<string | null>(null);
  const [batchImportSuccess, setBatchImportSuccess] = useState<string | null>(null);
  const [isBatchSaving, setIsBatchSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered Students List
  const filteredStudents = useMemo(() => {
    return students
      .filter((student) => {
        // Only student role
        if (student.role !== 'student') return false;

        // Status filter
        if (statusFilter !== 'all') {
          const studentStatus = student.status || 'active';
          if (studentStatus !== statusFilter) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = student.name?.toLowerCase().includes(q);
          const matchEmail = student.email?.toLowerCase().includes(q);
          const matchPhone = student.phone?.includes(q);
          if (!matchName && !matchEmail && !matchPhone) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name, 'ar');
        if (sortBy === 'target') return (b.targetScore || 0) - (a.targetScore || 0);
        // Default joined date
        return (b.joinedDate || '').localeCompare(a.joinedDate || '');
      });
  }, [students, statusFilter, searchQuery, sortBy]);

  // Statistics
  const totalStudents = students.filter((s) => s.role === 'student').length;
  const activeStudents = students.filter((s) => s.role === 'student' && s.status !== 'disabled').length;
  const disabledStudents = students.filter((s) => s.role === 'student' && s.status === 'disabled').length;
  const avgTargetScore =
    totalStudents > 0
      ? Math.round(
          students
            .filter((s) => s.role === 'student')
            .reduce((acc, s) => acc + (s.targetScore || 85), 0) / totalStudents
        )
      : 85;

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingStudentId(null);
    setFormName('');
    setFormEmail('');
    setFormPhone('');
    setFormTargetScore(85);
    setFormStatus('active');
    setFormError(null);
    setIsAddEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (student: StudentUser) => {
    setEditingStudentId(student.id);
    setFormName(student.name);
    setFormEmail(student.email);
    setFormPhone(student.phone || '');
    setFormTargetScore(student.targetScore || 85);
    setFormStatus(student.status || 'active');
    setFormError(null);
    setIsAddEditModalOpen(true);
  };

  // Submit Add / Edit
  const handleSubmitAddEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim()) {
      setFormError('يرجى كتابة اسم الطالب والبريد الإلكتروني.');
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      if (editingStudentId) {
        await updateStudent(editingStudentId, {
          name: formName.trim(),
          email: formEmail.trim().toLowerCase(),
          phone: formPhone.trim() || undefined,
          targetScore: Number(formTargetScore) || 85,
          status: formStatus,
        });
      } else {
        await addStudent({
          name: formName.trim(),
          email: formEmail.trim().toLowerCase(),
          phone: formPhone.trim() || undefined,
          targetScore: Number(formTargetScore) || 85,
          status: formStatus,
        });
      }
      setIsAddEditModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'حدث خطأ أثناء حفظ بيانات الطالب.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open View Details
  const handleViewDetails = async (student: StudentUser) => {
    setIsLoadingDetails(true);
    setIsDetailsModalOpen(true);
    setSelectedStudentDetails({
      student,
      attempts: [],
      mistakes: [],
      studyPlan: null,
    });
    try {
      const details = await getStudentDetails(student.id);
      setSelectedStudentDetails(details);
    } catch (err) {
      console.error('Error fetching details:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  // Toggle Status
  const handleToggleStatus = async (student: StudentUser) => {
    try {
      await toggleStudentStatus(student.id);
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  // Delete Student
  const handleConfirmDelete = async () => {
    if (!deleteConfirmStudent) return;
    setIsDeleting(true);
    try {
      await deleteStudent(deleteConfirmStudent.id);
      setDeleteConfirmStudent(null);
    } catch (err) {
      console.error('Failed to delete student:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Export Students to Excel
  const handleExportExcel = () => {
    const data = filteredStudents.map((s, idx) => ({
      '#': idx + 1,
      'اسم الطالب': s.name,
      'البريد الإلكتروني': s.email,
      'رقم الجوال': s.phone || 'غير مسجل',
      'الحالة': s.status === 'disabled' ? 'معطل' : 'نشط',
      'الدرجة المستهدفة': s.targetScore || 85,
      'تاريخ الانضمام': s.joinedDate || '—',
      'آخر نشاط': s.lastActiveDate || '—',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'الطلاب');
    XLSX.writeFile(workbook, `STEP_Students_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Download Sample Template for Batch Import
  const handleDownloadTemplate = () => {
    const sample = [
      {
        'اسم الطالب': 'عبدالرحمن الشهري',
        'البريد الإلكتروني': 'abdulrahman@example.com',
        'رقم الجوال': '0501234567',
        'الدرجة المستهدفة': 85,
        'الحالة': 'نشط',
      },
      {
        'اسم الطالب': 'سارة المطيري',
        'البريد الإلكتروني': 'sarah@example.com',
        'رقم الجوال': '0559876543',
        'الدرجة المستهدفة': 90,
        'الحالة': 'نشط',
      },
    ];
    const ws = XLSX.utils.json_to_sheet(sample);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'قالب_الطلاب');
    XLSX.writeFile(wb, 'قالب_استيراد_الطلاب_STEP.xlsx');
  };

  // Handle Excel File Select for Batch Import
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBatchImportError(null);
    setBatchImportSuccess(null);
    setBatchFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const workbook = XLSX.read(buffer, { type: 'binary' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!jsonRows || jsonRows.length === 0) {
          throw new Error('الملف فارغ أو لا يحتوي على صفوف بيانات.');
        }

        const validParsed: Array<{
          name: string;
          email: string;
          targetScore?: number;
          phone?: string;
          status?: 'active' | 'disabled';
        }> = [];

        jsonRows.forEach((row) => {
          const name = String(row['اسم الطالب'] || row['الاسم'] || row['Name'] || row['name'] || '').trim();
          const email = String(row['البريد الإلكتروني'] || row['البريد'] || row['Email'] || row['email'] || '').trim().toLowerCase();
          const phone = String(row['رقم الجوال'] || row['الجوال'] || row['الهاتف'] || row['Phone'] || '').trim();
          const score = Number(row['الدرجة المستهدفة'] || row['الدرجة'] || row['Target'] || 85);
          const rawStatus = String(row['الحالة'] || row['Status'] || '').trim().toLowerCase();
          const status: 'active' | 'disabled' = rawStatus.includes('معطل') || rawStatus === 'disabled' ? 'disabled' : 'active';

          if (name && email && email.includes('@')) {
            validParsed.push({
              name,
              email,
              phone: phone || undefined,
              targetScore: isNaN(score) ? 85 : score,
              status,
            });
          }
        });

        if (validParsed.length === 0) {
          throw new Error('لم يتم العثور على سجلات صالحة تحتوي على اسم وبريد إلكتروني.');
        }

        setBatchParsedData(validParsed);
      } catch (err: any) {
        setBatchImportError(err.message || 'فشل في قراءة ملف Excel.');
        setBatchParsedData([]);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Submit Batch Import
  const handleExecuteBatchImport = async () => {
    if (batchParsedData.length === 0) return;
    setIsBatchSaving(true);
    setBatchImportError(null);
    try {
      const res = await batchImportStudents(batchParsedData, true);
      setBatchImportSuccess(`تم استيراد ${res.added} طالب جديد وتحديث ${res.updated} بنجاح ✅`);
      setBatchParsedData([]);
      setBatchFileName(null);
    } catch (err: any) {
      setBatchImportError(err.message || 'حدث خطأ أثناء حفظ الطلاب في قاعدة البيانات.');
    } finally {
      setIsBatchSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-right">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-950 text-white flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">إدارة حسابات الطلاب</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            استعراض الطلاب المسجلين سحابياً، البحث، تعديل البيانات، والتحكم في تفعيل أو تعطيل الحسابات.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
          <button
            onClick={() => loadStudents()}
            disabled={isLoadingStudents}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="تحديث قائمة الطلاب"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStudents ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">تحديث</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="py-2.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير Excel</span>
          </button>

          <button
            onClick={() => {
              setBatchImportError(null);
              setBatchImportSuccess(null);
              setBatchParsedData([]);
              setBatchFileName(null);
              setIsBatchImportOpen(true);
            }}
            className="py-2.5 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>استيراد مجمّع</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="py-2.5 px-4 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة طالب جديد</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 block">إجمالي الطلاب</span>
            <span className="text-xl font-extrabold text-slate-900 tabular-nums">{totalStudents}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-950 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-600 block">الحسابات النشطة</span>
            <span className="text-xl font-extrabold text-emerald-700 tabular-nums">{activeStudents}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-rose-600 block">الحسابات المعطلة</span>
            <span className="text-xl font-extrabold text-rose-700 tabular-nums">{disabledStudents}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <UserX className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-amber-600 block">متوسط الدرجة المطلوبة</span>
            <span className="text-xl font-extrabold text-amber-700 tabular-nums">{avgTargetScore} / 100</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم أو البريد أو الجوال..."
            className="w-full pr-10 pl-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:border-blue-900 focus:bg-white transition-all text-right"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('all')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              الكل ({totalStudents})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'active' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              نشط ({activeStudents})
            </button>
            <button
              onClick={() => setStatusFilter('disabled')}
              className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'disabled' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              معطل ({disabledStudents})
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 mr-2">
            <Filter className="w-3.5 h-3.5" />
            <span>ترتيب:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-xs font-semibold text-slate-700 focus:outline-hidden"
            >
              <option value="joined">الأحدث انضماماً</option>
              <option value="name">أبجدياً بالاسم</option>
              <option value="target">الأعلى درجة مستهدفة</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoadingStudents ? (
          <div className="p-12 text-center text-slate-400 space-y-2">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-900" />
            <p className="text-xs font-medium">جاري تحميل بيانات الطلاب من قاعدة البيانات...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">لا يوجد طلاب مطابقين للبحث</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'جرب تغيير معايير البحث أو تصفية الحالة لعرض السجلات.'
                : 'لم يتم إضافة أي طلاب حتى الآن. يمكنك إضافة طالب جديد أو استيراد ملف Excel مجمّع.'}
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-2 py-2 px-4 bg-blue-950 text-white rounded-xl text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>إضافة طالب الآن</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                <tr>
                  <th className="py-3.5 px-4">الطالب</th>
                  <th className="py-3.5 px-4">بيانات الاتصال</th>
                  <th className="py-3.5 px-4 text-center">الدرجة المستهدفة</th>
                  <th className="py-3.5 px-4 text-center">الحالة</th>
                  <th className="py-3.5 px-4">تاريخ الانضمام</th>
                  <th className="py-3.5 px-4">آخر نشاط</th>
                  <th className="py-3.5 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => {
                  const isAccountDisabled = student.status === 'disabled';
                  return (
                    <tr
                      key={student.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isAccountDisabled ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0 font-bold ${
                              isAccountDisabled
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-blue-50 text-blue-950'
                            }`}
                          >
                            {student.avatar || '🎓'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{student.name}</span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              ID: {student.id.slice(0, 12)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Email & Phone */}
                      <td className="py-3 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-700" dir="ltr">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span className="font-mono text-[11px]">{student.email}</span>
                          </div>
                          {student.phone ? (
                            <div className="flex items-center gap-1.5 text-slate-500" dir="ltr">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span className="font-mono text-[11px]">{student.phone}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400">لا يوجد جوال</span>
                          )}
                        </div>
                      </td>

                      {/* Target Score */}
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 font-bold text-slate-900 bg-amber-50 text-amber-900 border border-amber-200/80 px-2 py-0.5 rounded-lg text-[11px]">
                          <Award className="w-3 h-3 text-amber-600" />
                          <span>{student.targetScore || 85}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        {isAccountDisabled ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
                            <UserX className="w-3 h-3" />
                            <span>معطل</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                            <UserCheck className="w-3 h-3" />
                            <span>نشط</span>
                          </span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        {student.joinedDate || '—'}
                      </td>

                      {/* Last Active */}
                      <td className="py-3 px-4 text-slate-600 text-[11px]">
                        {student.lastActiveDate || student.lastLogin?.split('T')[0] || '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* View details */}
                          <button
                            onClick={() => handleViewDetails(student)}
                            className="p-1.5 text-slate-600 hover:text-blue-950 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="عرض تفاصيل وتقدم الطالب"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => handleOpenEdit(student)}
                            className="p-1.5 text-slate-600 hover:text-blue-950 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="تعديل بيانات الحساب"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Toggle Active / Disabled */}
                          <button
                            onClick={() => handleToggleStatus(student)}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isAccountDisabled
                                ? 'text-emerald-700 hover:bg-emerald-50'
                                : 'text-amber-700 hover:bg-amber-50'
                            }`}
                            title={isAccountDisabled ? 'تفعيل الحساب' : 'تعطيل الحساب'}
                          >
                            {isAccountDisabled ? (
                              <UserCheck className="w-4 h-4" />
                            ) : (
                              <UserX className="w-4 h-4" />
                            )}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteConfirmStudent(student)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="حذف الحساب نهائياً"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* Add / Edit Student Modal */}
      {/* ============================================================== */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-right animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {editingStudentId ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}
                </h3>
                <div className="w-8 h-8 rounded-xl bg-blue-950 text-white flex items-center justify-center">
                  <GraduationCap className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmitAddEdit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">اسم الطالب الثلاثي *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="مثال: خالد محمد العمري"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-900 focus:bg-white text-right"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">البريد الإلكتروني *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="student@example.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-900 focus:bg-white text-left font-mono"
                  dir="ltr"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">رقم الجوال (اختياري)</label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="05xxxxxxxx"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-900 focus:bg-white text-left font-mono"
                  dir="ltr"
                />
              </div>

              {/* Target Score & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">الدرجة المستهدفة</label>
                  <input
                    type="number"
                    min={20}
                    max={100}
                    value={formTargetScore}
                    onChange={(e) => setFormTargetScore(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-blue-900 focus:bg-white text-center font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">حالة الحساب</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-hidden"
                  >
                    <option value="active">نشط (مفعل)</option>
                    <option value="disabled">معطل (موقوف)</option>
                  </select>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="py-2.5 px-5 bg-blue-950 hover:bg-blue-900 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري الحفظ...</span>
                    </>
                  ) : (
                    <span>{editingStudentId ? 'حفظ التعديلات' : 'إضافة الطالب'}</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Student Details / Progress View Modal */}
      {/* ============================================================== */}
      {isDetailsModalOpen && selectedStudentDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div
            className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-right max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0 bg-slate-50">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    ملف تقدم الطالب: {selectedStudentDetails.student?.name}
                  </h3>
                  <span className="text-xs text-slate-500 font-mono" dir="ltr">
                    {selectedStudentDetails.student?.email}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-blue-950 text-white flex items-center justify-center text-lg">
                  {selectedStudentDetails.student?.avatar || '🎓'}
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {isLoadingDetails ? (
                <div className="py-12 text-center space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-900" />
                  <p className="text-xs text-slate-500">جاري استرجاع تفاصيل الأداء من Firestore...</p>
                </div>
              ) : (
                <>
                  {/* Overview Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                      <span className="text-[11px] font-bold text-slate-500 block">الاختبارات المنجزة</span>
                      <span className="text-lg font-extrabold text-slate-900 tabular-nums">
                        {selectedStudentDetails.attempts.filter((a) => a.status === 'completed').length}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                      <span className="text-[11px] font-bold text-slate-500 block">أعلى درجة</span>
                      <span className="text-lg font-extrabold text-emerald-700 tabular-nums">
                        {Math.max(
                          0,
                          ...selectedStudentDetails.attempts
                            .filter((a) => a.scorePercent !== undefined)
                            .map((a) => a.scorePercent || 0)
                        )}
                        %
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                      <span className="text-[11px] font-bold text-slate-500 block">بنك الأخطاء</span>
                      <span className="text-lg font-extrabold text-rose-700 tabular-nums">
                        {selectedStudentDetails.mistakes.length}
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                      <span className="text-[11px] font-bold text-slate-500 block">حالة الخطة</span>
                      <span className="text-xs font-extrabold text-blue-900 block mt-1">
                        {selectedStudentDetails.studyPlan ? 'نشطة ✅' : 'لا يوجد جدول'}
                      </span>
                    </div>
                  </div>

                  {/* Active Study Plan */}
                  {selectedStudentDetails.studyPlan && (
                    <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-950 flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-blue-900" />
                          <span>الخطة الحالية: {selectedStudentDetails.studyPlan.title}</span>
                        </span>
                        {selectedStudentDetails.studyPlan.targetDate && (
                          <span className="text-[11px] text-blue-800 font-semibold">
                            موعد الاختبار: {selectedStudentDetails.studyPlan.targetDate}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-blue-900/80">
                        المهام المنجزة:{' '}
                        {selectedStudentDetails.studyPlan.tasks?.filter((t) => t.completed).length || 0} من{' '}
                        {selectedStudentDetails.studyPlan.tasks?.length || 0} مهمة.
                      </p>
                    </div>
                  )}

                  {/* Attempts List */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>سجل الاختبارات والمحاولات</span>
                    </h4>

                    {selectedStudentDetails.attempts.length === 0 ? (
                      <p className="text-xs text-slate-400 bg-slate-50 p-4 rounded-xl text-center">
                        لم يقم هذا الطالب بأي اختبارات تجريبية حتى الآن.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {selectedStudentDetails.attempts.map((attempt) => (
                          <div
                            key={attempt.id}
                            className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs"
                          >
                            <div>
                              <strong className="block text-slate-900">{attempt.modelTitle}</strong>
                              <span className="text-[11px] text-slate-500">
                                {attempt.startedAt?.split('T')[0]} — المحاولة #{attempt.attemptNumber}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              {attempt.status === 'completed' ? (
                                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs">
                                  {attempt.scorePercent}%
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-lg bg-amber-100 text-amber-800 font-semibold text-[11px]">
                                  قيد الحل
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end shrink-0">
              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="py-2 px-5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Batch Import Excel Modal */}
      {/* ============================================================== */}
      {isBatchImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div
            className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden text-right animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <button
                onClick={() => setIsBatchImportOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">استيراد حسابات الطلاب من Excel</h3>
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <p className="text-xs text-slate-600 leading-relaxed">
                ارفع ملف Excel يحتوي على بيانات الطلاب. الأعمدة المدعومة:{' '}
                <strong className="text-slate-900">اسم الطالب، البريد الإلكتروني، رقم الجوال، الدرجة المستهدفة</strong>.
              </p>

              {/* Sample Template Download */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">نموذج ملف Excel الجاهز</span>
                  <span className="text-[11px] text-slate-500">قم بتحميل القالب وتعبئة بيانات الطلاب</span>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="py-1.5 px-3 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تحميل القالب</span>
                </button>
              </div>

              {/* Upload Dropzone */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".xlsx, .xls, .csv"
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-indigo-500 bg-slate-50/50 hover:bg-indigo-50/30 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center mx-auto">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    {batchFileName ? batchFileName : 'اضغط لاختيار ملف Excel أو CSV من جهازك'}
                  </span>
                  <span className="text-[11px] text-slate-400">يدعم صيغ .xlsx و .xls و .csv</span>
                </div>
              </div>

              {/* Error / Success messages */}
              {batchImportError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{batchImportError}</span>
                </div>
              )}

              {batchImportSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{batchImportSuccess}</span>
                </div>
              )}

              {/* Preview of Parsed Rows */}
              {batchParsedData.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">
                      معاينة الطلاب الجاهزين للاستيراد ({batchParsedData.length} طالب):
                    </span>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
                    {batchParsedData.slice(0, 15).map((row, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between bg-white">
                        <div className="flex items-center gap-2">
                          <span className="w-5 text-slate-400 font-mono text-[10px]">{idx + 1}</span>
                          <span className="font-bold text-slate-800">{row.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-slate-500 font-mono" dir="ltr">
                            {row.email}
                          </span>
                          <span className="font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">
                            {row.targetScore || 85}
                          </span>
                        </div>
                      </div>
                    ))}
                    {batchParsedData.length > 15 && (
                      <div className="p-2 text-center text-[11px] text-slate-400 bg-slate-50">
                        + {batchParsedData.length - 15} طلاب إضافيين في الملف...
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsBatchImportOpen(false)}
                className="py-2 px-4 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold cursor-pointer"
              >
                إغلاق
              </button>

              <button
                type="button"
                onClick={handleExecuteBatchImport}
                disabled={batchParsedData.length === 0 || isBatchSaving}
                className="py-2 px-5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
              >
                {isBatchSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري الاستيراد...</span>
                  </>
                ) : (
                  <span>بدء استيراد {batchParsedData.length} طالب</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* Delete Confirmation Modal */}
      {/* ============================================================== */}
      {deleteConfirmStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs">
          <div
            className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 text-right space-y-4 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">تأكيد حذف حساب الطالب</h3>
              <p className="text-xs text-slate-600">
                هل أنت متأكد من حذف حساب الطالب <strong className="text-slate-900">{deleteConfirmStudent.name}</strong>؟
                سيتم حذف كافة محاولاته وبنك أخطائه نهائياً من قاعدة البيانات.
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmStudent(null)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري الحذف...</span>
                  </>
                ) : (
                  <span>نعم، احذف الحساب</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
