import React, { useState } from 'react';
import { Student, AppState, GradeLevel, Gender } from '../types';
import { FileSpreadsheet, X, Upload, Download, Copy, Check, AlertCircle } from 'lucide-react';

interface ImportExportModalProps {
  students: Student[];
  appState: AppState;
  onClose: () => void;
  onImportStudents: (newStudents: Student[]) => void;
  onRestoreFullState: (newState: AppState) => void;
}

export const ImportExportModal: React.FC<ImportExportModalProps> = ({
  students,
  appState,
  onClose,
  onImportStudents,
  onRestoreFullState,
}) => {
  const [activeTab, setActiveTab] = useState<'quick_paste' | 'csv_export' | 'json_backup'>('quick_paste');
  const [pastedText, setPastedText] = useState('');
  const [defaultGrade, setDefaultGrade] = useState<GradeLevel>('أولى إعدادي');
  const [defaultGender, setDefaultGender] = useState<Gender>('بنين');
  const [defaultFamily, setDefaultFamily] = useState('أسرة الشهيد مارجرجس');
  const [copySuccess, setCopySuccess] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  // Parse lines for quick paste
  const handleQuickPasteImport = () => {
    if (!pastedText.trim()) return;

    const lines = pastedText.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
    const parsedStudents: Student[] = [];

    lines.forEach((line, index) => {
      // Split by comma, tab, or dash
      const parts = line.split(/[,;\t-]/).map((p) => p.trim());
      const name = parts[0];
      if (!name) return;

      // Detect grade if specified in the text
      let grade: GradeLevel = defaultGrade;
      if (line.includes('اولى') || line.includes('أولى')) grade = 'أولى إعدادي';
      else if (line.includes('تانية') || line.includes('ثانية')) grade = 'ثانية إعدادي';
      else if (line.includes('تالتة') || line.includes('ثالثة')) grade = 'ثالثة إعدادي';

      // Detect gender if specified
      let gender: Gender = defaultGender;
      if (line.includes('بنت') || line.includes('بنات')) gender = 'بنات';
      else if (line.includes('ولد') || line.includes('بنين')) gender = 'بنين';

      // Family if available in parts
      const family = parts[3] || defaultFamily;
      const phone = parts[4] || '';

      parsedStudents.push({
        id: `std-imp-${Date.now()}-${index}`,
        name,
        grade,
        gender,
        family,
        phone: phone || undefined,
        rewardsClaimed: [],
      });
    });

    if (parsedStudents.length > 0) {
      onImportStudents(parsedStudents);
      setImportedCount(parsedStudents.length);
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  // Generate CSV string
  const generateCSV = () => {
    const headers = ['الاسم', 'المرحلة', 'النوع', 'الأسرة', 'تاريخ الميلاد', 'تليفون المخدوم', 'تليفون ولي الأمر', 'ملاحظات', 'رابط الصورة'];
    const rows = students.map((s) => [
      s.name,
      s.grade,
      s.gender,
      s.family,
      s.birthDate || '',
      s.phone || '',
      s.parentPhone || '',
      s.notes || '',
      s.photoUrl || '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.map((cell) => `"${cell}"`).join(','))].join('\n');
    return csvContent;
  };

  // Download CSV
  const handleDownloadCSV = () => {
    const csv = '\uFEFF' + generateCSV(); // UTF-8 BOM for Arabic Excel
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `كشف_مخدومي_إعدادي_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Copy CSV to clipboard
  const handleCopyCSV = () => {
    navigator.clipboard.writeText(generateCSV());
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  // JSON Full Backup download
  const handleDownloadJSON = () => {
    const jsonStr = JSON.stringify(appState, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `نسخة_احتياطية_خدمة_إعدادي_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // JSON Restore
  const handleJSONUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.students && parsed.rewardTiers) {
          onRestoreFullState(parsed);
          alert('تم استعادة النسخة الاحتياطية بنجاح!');
          onClose();
        } else {
          alert('الملف غير صالح أو لا يحتوي على بنية بيانات الخدمة.');
        }
      } catch (err) {
        alert('حدث خطأ أثناء قراءة ملف JSON.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute left-5 top-5 p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">إدارة وداتا المخدومين (Excel / JSON)</h3>
            <p className="text-xs text-slate-500">
              استيراد كشوف الأولاد والبنات دفعة واحدة، أو تصدير نسخة احتياطية لبرنامج إكسيل.
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-2xl bg-slate-100 p-1 mb-5">
          <button
            onClick={() => setActiveTab('quick_paste')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'quick_paste' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            📋 لصق واستيراد الأسماء
          </button>
          <button
            onClick={() => setActiveTab('csv_export')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'csv_export' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            📊 تصدير كشف Excel (CSV)
          </button>
          <button
            onClick={() => setActiveTab('json_backup')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'json_backup' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            💾 نسخة احتياطية كاملة
          </button>
        </div>

        {/* TAB 1: QUICK PASTE */}
        {activeTab === 'quick_paste' && (
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-900 space-y-1">
              <p className="font-bold">💡 طريقة الاستيراد السريعة:</p>
              <p>انسخ أسماء الأولاد من ملف وورد أو إكسيل أو واتساب والصقها في المربع أدناه (كل اسم في سطر منفصل).</p>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">المرحلة الافتراضية</label>
                <select
                  value={defaultGrade}
                  onChange={(e) => setDefaultGrade(e.target.value as GradeLevel)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
                >
                  <option value="أولى إعدادي">أولى إعدادي</option>
                  <option value="ثانية إعدادي">ثانية إعدادي</option>
                  <option value="ثالثة إعدادي">ثالثة إعدادي</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">النوع الافتراضي</label>
                <select
                  value={defaultGender}
                  onChange={(e) => setDefaultGender(e.target.value as Gender)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
                >
                  <option value="بنين">بنين</option>
                  <option value="بنات">بنات</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">الأسرة الافتراضية</label>
                <input
                  type="text"
                  value={defaultFamily}
                  onChange={(e) => setDefaultFamily(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                الصق الأسماء هنا (اسم في كل سطر):
              </label>
              <textarea
                rows={6}
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder={"مارك مينا إبراهيم\nكيرلس هاني عادل\nجورج عماد عزيز\nيوحنا بيشوي كامل"}
                className="w-full p-3 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-2xl focus:bg-white focus:ring-2 focus:ring-amber-500 font-mono leading-relaxed"
              />
            </div>

            {importedCount !== null && (
              <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>تمت إضافة {importedCount} مخدوم بنجاح إلى قاعدة البيانات!</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleQuickPasteImport}
                disabled={!pastedText.trim()}
                className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-stone-950 font-black text-xs rounded-xl transition shadow-md flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>استيراد وإضافة للخدمة</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: CSV EXPORT */}
        {activeTab === 'csv_export' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              يمكنك تصدير كشف كامل بكافة مخدومي إعدادي الحاليين ({students.length} مخدوم) بتنسيق ملف CSV متوافق 100% مع Microsoft Excel واللغة العربية.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>إجمالي المسجلين للتصدير:</span>
                <span className="text-amber-800 font-black">{students.length} مخدوم</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleDownloadCSV}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل كشف Excel (.CSV)</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyCSV}
                  className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                >
                  {copySuccess ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4" />}
                  <span>{copySuccess ? 'تم النسخ' : 'نسخ الكشف'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: JSON FULL BACKUP & RESTORE */}
        {activeTab === 'json_backup' && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl space-y-2">
              <h4 className="text-xs font-black text-blue-900">تنزيل نسخة احتياطية كاملة (JSON)</h4>
              <p className="text-xs text-blue-800/80">
                تحتفظ هذه النسخة بكافة سجلات الحضور، النقاط، قواعد الهدايا، وتاريخ كل مخدوم.
              </p>
              <button
                type="button"
                onClick={handleDownloadJSON}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-sm flex items-center gap-1.5"
              >
                <Download className="w-4 h-4" />
                <span>تنزيل النسخة الاحتياطية</span>
              </button>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
              <h4 className="text-xs font-black text-slate-900">استعادة نسخة سابقة</h4>
              <p className="text-xs text-slate-500">اختر ملف نسخة احتياطية سبق تنزيله لاسترجاع كافة البيانات.</p>
              <input
                type="file"
                accept=".json"
                onChange={handleJSONUpload}
                className="text-xs text-slate-600 file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-200 file:text-slate-800 hover:file:bg-slate-300 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
