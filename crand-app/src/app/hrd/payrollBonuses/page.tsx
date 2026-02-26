"use client";

import React, { useState, useEffect } from "react";
import { getDepartmentsOptions, getBranchOfficesOptions } from "../teachers/action";
import { getBonuses, seedBonuses, sendSlipsToAll } from "./action";
import * as XLSX from "xlsx";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { 
  Download, 
  Upload, 
  Settings, 
  Plus, 
  Send, 
  Search, 
  FileSpreadsheet,
  MoreHorizontal,
  Pencil,
  Trash2,
  FileUp,
  X
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PayrollBonusesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
  const [branchOptions, setBranchOptions] = useState<string[]>([]);

  const [bonuses, setBonuses] = useState<any[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const depts = await getDepartmentsOptions();
        const branches = await getBranchOfficesOptions();
        setDepartmentOptions(depts);
        setBranchOptions(branches);
      } catch (error) {
        console.error("Failed to fetch options", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchBonuses = async () => {
      try {
        const data = await getBonuses({
          unit: selectedUnit,
          branch: selectedBranch,
          department: selectedDepartment,
          month: selectedMonth,
          year: selectedYear,
          query: searchQuery
        });
        setBonuses(data);
      } catch (error) {
        console.error("Failed to fetch bonuses", error);
      }
    };
    fetchBonuses();
  }, [selectedUnit, selectedBranch, selectedDepartment, selectedMonth, selectedYear, searchQuery]);
  
  // State for Default Settings Template
  const [incomeTemplates, setIncomeTemplates] = useState([
    { id: 1, name: "bonus team" },
    { id: 2, name: "bonus basil" },
    { id: 3, name: "bonus endapan" },
  ]);
  const [deductionTemplates, setDeductionTemplates] = useState([
    { id: 1, name: "" }, // Initial empty row as shown in screenshot concept
  ]);

  const handleAddIncome = () => {
    const newId = Math.max(...incomeTemplates.map(t => t.id), 0) + 1;
    setIncomeTemplates([...incomeTemplates, { id: newId, name: "" }]);
  };

  const handleRemoveIncome = (id: number) => {
    setIncomeTemplates(incomeTemplates.filter(t => t.id !== id));
  };

  const handleUpdateIncome = (id: number, newName: string) => {
    setIncomeTemplates(incomeTemplates.map(t => t.id === id ? { ...t, name: newName } : t));
  };

  const handleAddDeduction = () => {
    const newId = Math.max(...deductionTemplates.map(t => t.id), 0) + 1;
    setDeductionTemplates([...deductionTemplates, { id: newId, name: "" }]);
  };

  const handleRemoveDeduction = (id: number) => {
    setDeductionTemplates(deductionTemplates.filter(t => t.id !== id));
  };

  const handleUpdateDeduction = (id: number, newName: string) => {
    setDeductionTemplates(deductionTemplates.map(t => t.id === id ? { ...t, name: newName } : t));
  };

  // State for Add Data Form
  const [addDataOpen, setAddDataOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [formIncomes, setFormIncomes] = useState<{ id: number; name: string; amount: string }[]>([]);
  const [formDeductions, setFormDeductions] = useState<{ id: number; name: string; amount: string }[]>([]);

  // Initialize form data when opening the modal
  const handleOpenAddData = () => {
    setFormIncomes(incomeTemplates.map(t => ({ ...t, amount: "" })));
    setFormDeductions(deductionTemplates.map(t => ({ ...t, amount: "" })));
    setAddDataOpen(true);
  };

  const handleAddFormIncome = () => {
    const newId = Math.max(...formIncomes.map(t => t.id), 0) + 1;
    setFormIncomes([...formIncomes, { id: newId, name: "", amount: "" }]);
  };

  const handleRemoveFormIncome = (id: number) => {
    setFormIncomes(formIncomes.filter(t => t.id !== id));
  };

  const handleUpdateFormIncome = (id: number, field: 'name' | 'amount', value: string) => {
    setFormIncomes(formIncomes.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const handleAddFormDeduction = () => {
    const newId = Math.max(...formDeductions.map(t => t.id), 0) + 1;
    setFormDeductions([...formDeductions, { id: newId, name: "", amount: "" }]);
  };

  const handleRemoveFormDeduction = (id: number) => {
    setFormDeductions(formDeductions.filter(t => t.id !== id));
  };

  const handleUpdateFormDeduction = (id: number, field: 'name' | 'amount', value: string) => {
    setFormDeductions(formDeductions.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  // Mock data for visualization - REMOVED, using real data from DB
  /* 
  const bonuses = ... 
  */
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(amount);
  };

  const handleExportBonus = () => {
    // Prepare data for Excel
    const monthName = selectedMonth ? new Date(0, parseInt(selectedMonth) - 1).toLocaleString('id-ID', { month: 'long' }) : "-";
    const yearVal = selectedYear || "-";

    const exportData = bonuses.map(bonus => ({
      "No Karyawan/NIP": bonus.nip,
      "Nama Karyawan": bonus.name,
      "Bank": bonus.bank,
      "No Rekening": bonus.rekening,
      "Nama Pemilik Rekening": bonus.name,
      "Bulan": monthName,
      "Tahun": yearVal,
      "Total": bonus.total,
      "PPh 21": bonus.pph21
    }));

    // Calculate totals
    const totalBonus = exportData.reduce((acc, curr) => acc + curr.Total, 0);
    const totalPPh21 = exportData.reduce((acc, curr) => acc + curr["PPh 21"], 0);

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);

    // Add "Total Semua" row
    // json_to_sheet creates range A1:I(N+1). We want to append at the bottom.
    // The data ends at row: exportData.length + 1 (header)
    const lastRowIndex = exportData.length + 1; // 0-based index for the new row

    XLSX.utils.sheet_add_aoa(ws, [
      ["", "", "", "", "", "Total Semua", "", totalBonus, totalPPh21]
    ], { origin: -1 }); // origin -1 appends to the end

    // Merge cells for "Total Semua" (Columns F and G, which are indices 5 and 6)
    // Row index is lastRowIndex
    if (!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push({
      s: { r: lastRowIndex, c: 5 }, // Start: Row lastRowIndex, Col 5 (Bulan)
      e: { r: lastRowIndex, c: 6 }  // End: Row lastRowIndex, Col 6 (Tahun)
    });

    // Create workbook and download
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data Bonus");
    
    const fileNameMonth = selectedMonth || "-";
    const fileNameYear = selectedYear || "-";
    XLSX.writeFile(wb, `Daftar Bonus Karyawan Bulan ke-${fileNameMonth} Tahun ${fileNameYear}.xlsx`);
  };

  const handleExportToExcelSimple = () => {
    const exportData = bonuses.map(bonus => ({
      "No Karyawan": bonus.nip,
      "Nama": bonus.name,
      "Tanggal Pemberian": bonus.date,
      "Total": bonus.total
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Data");
    XLSX.writeFile(wb, "Hitung Bonus.xlsx");
  };

  const handleDownloadTemplate = () => {
    // Define headers dynamically based on templates
    const incomeHeaders = incomeTemplates.map(t => t.name);
    const totalIncomeCols = Math.max(incomeHeaders.length, 1); // Ensure at least 1 column
    
    // Header Row 1
    const row1 = ["No Karyawan", "Nama Karyawan", "Bulan", "Tahun", "Pendapatan"];
    // Fill empty cells for merged header (totalIncomeCols - 1 because "Pendapatan" takes 1 spot already)
    for (let i = 0; i < totalIncomeCols - 1; i++) row1.push("");
    
    // Header Row 2
    const row2 = ["", "", "", "", ...incomeHeaders];
    
    // If no templates, just put empty string
    if (incomeHeaders.length === 0) row2.push("");

    const headers = [row1, row2];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(headers);

    // Merge cells for "Pendapatan"
    // Pendapatan starts at col 4 (E). Ends at 4 + totalIncomeCols - 1.
    if (!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push(
      { s: { r: 0, c: 0 }, e: { r: 1, c: 0 } }, // No Karyawan
      { s: { r: 0, c: 1 }, e: { r: 1, c: 1 } }, // Nama Karyawan
      { s: { r: 0, c: 2 }, e: { r: 1, c: 2 } }, // Bulan
      { s: { r: 0, c: 3 }, e: { r: 1, c: 3 } }, // Tahun
      { s: { r: 0, c: 4 }, e: { r: 0, c: 4 + totalIncomeCols - 1 } }  // Pendapatan
    );

    XLSX.utils.book_append_sheet(wb, ws, "Template");
    XLSX.writeFile(wb, "template-hitung-bonus.xlsx");
  };

  const handleSeedData = async () => {
    try {
      const result = await seedBonuses();
      if (result.success) {
         const data = await getBonuses({
           unit: selectedUnit,
           branch: selectedBranch,
           department: selectedDepartment,
           month: selectedMonth,
           year: selectedYear,
           query: searchQuery
         });
         setBonuses(data);
         alert(result.message);
      } else {
         alert(result.message);
      }
    } catch (error) {
      console.error("Failed to seed data", error);
      alert("Failed to seed data");
    }
  };

  const handleSendSlips = async () => {
    if (!confirm("Apakah anda yakin ingin mengirim slip gaji ke semua guru yang sesuai dengan filter saat ini?")) {
      return;
    }

    try {
      const result = await sendSlipsToAll({
        unit: selectedUnit,
        branch: selectedBranch,
        department: selectedDepartment,
        month: selectedMonth,
        year: selectedYear,
        query: searchQuery
      });
      
      if (result.success) {
         const data = await getBonuses({
           unit: selectedUnit,
           branch: selectedBranch,
           department: selectedDepartment,
           month: selectedMonth,
           year: selectedYear,
           query: searchQuery
         });
         setBonuses(data);
         alert(result.message);
      } else {
         alert(result.message);
      }
    } catch (error) {
      console.error("Failed to send slips", error);
      alert("Gagal mengirim slip gaji.");
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-blue-50 to-teal-50 px-0 sm:px-6 py-6">
      <div className="max-w-[98%] mx-auto mt-6 bg-white rounded-2xl shadow-xl p-4 sm:p-6 border-t-4 border-blue-800">
        
        {/* Header Section */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-blue-800">Bonus/Tunjangan</h1>
              <p className="text-blue-600 mt-1">Kelola data bonus dan tunjangan karyawan.</p>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleSeedData} variant="outline" className="border-orange-600 text-orange-700 hover:bg-orange-50">
                <FileUp className="mr-2 h-4 w-4" />
                Generate Sample Data
              </Button>
              <Button onClick={handleSendSlips} variant="outline" className="border-blue-600 text-blue-700 hover:bg-blue-50">
                <Send className="mr-2 h-4 w-4" />
                Kirim Slip ke Semua
              </Button>
              <Button onClick={handleExportBonus} variant="outline" className="border-blue-600 text-blue-700 hover:bg-blue-50">
                <Download className="mr-2 h-4 w-4" />
                Ekspor Bonus
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-blue-600 text-blue-700 hover:bg-blue-50">
                    <Upload className="mr-2 h-4 w-4" />
                    Impor Bonus
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader className="border-b pb-4">
                    <DialogTitle className="text-xl font-bold text-slate-800">Impor Bonus</DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="mb-3 text-sm font-medium text-slate-700">Impor Data di sini:</p>
                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-24 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <p className="mb-1 text-sm text-slate-500"><span className="font-semibold">Choose File</span> No file chosen</p>
                        </div>
                        <input id="dropzone-file" type="file" className="hidden" accept=".xlsx, .xls" />
                      </label>
                    </div>
                    <p className="mt-4 text-sm text-slate-500 leading-relaxed">
                      Pastikan anda telah membuat file impor dengan format .xls atau .xlsx sesuai dengan template yang disediakan. Untuk mendapatkan template, silakan klik tombol download format import dibawah.
                    </p>
                  </div>
                  <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:justify-between pt-2 border-t">
                    <Button onClick={handleDownloadTemplate} className="bg-teal-700 hover:bg-teal-800 text-white w-full sm:w-auto">
                      <Download className="mr-2 h-4 w-4" />
                      Download Format Import
                    </Button>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white flex-1">
                        Impor Data
                      </Button>
                      <DialogClose asChild>
                        <Button variant="destructive" className="flex-1 bg-red-500 hover:bg-red-600">
                          Tutup
                        </Button>
                      </DialogClose>
                    </div>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="border-blue-600 text-blue-700 hover:bg-blue-50">
                    <Settings className="mr-2 h-4 w-4" />
                    Atur Nilai Default
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-800">Template Pendapatan/Potongan Bonus</DialogTitle>
                  </DialogHeader>
                  
                  <div className="py-4 space-y-8">
                    {/* Template Pendapatan Section */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-slate-800">Template Pendapatan Bonus</h3>
                        <Button onClick={handleAddIncome} className="bg-[#0D9488] hover:bg-[#0f766e] text-white rounded-full px-4 h-8 text-sm">
                          <Plus className="mr-1 h-4 w-4" /> Tambah
                        </Button>
                      </div>
                      
                      <div className="border rounded-md overflow-hidden">
                        <div className="grid grid-cols-12 bg-white border-b p-3">
                          <div className="col-span-10 font-semibold text-slate-900">Nama</div>
                          <div className="col-span-2 font-semibold text-slate-900">Aksi</div>
                        </div>
                        <div className="divide-y">
                          {incomeTemplates.map((item) => (
                            <div key={item.id} className="grid grid-cols-12 p-3 items-center gap-4 bg-white">
                              <div className="col-span-10">
                                <Input 
                                  value={item.name} 
                                  onChange={(e) => handleUpdateIncome(item.id, e.target.value)}
                                  className="bg-slate-50 border-slate-200" 
                                />
                              </div>
                              <div className="col-span-2">
                                <Button 
                                  onClick={() => handleRemoveIncome(item.id)}
                                  variant="destructive" 
                                  className="h-10 w-10 rounded-full bg-red-500 hover:bg-red-600 p-0 flex items-center justify-center"
                                >
                                  <Trash2 className="h-5 w-5 text-white" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Template Potongan Section */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-slate-800">Template Potongan Bonus</h3>
                        <Button onClick={handleAddDeduction} className="bg-[#0D9488] hover:bg-[#0f766e] text-white rounded-full px-4 h-8 text-sm">
                          <Plus className="mr-1 h-4 w-4" /> Tambah
                        </Button>
                      </div>
                      
                      <div className="border rounded-md overflow-hidden">
                        <div className="grid grid-cols-12 bg-white border-b p-3">
                          <div className="col-span-10 font-semibold text-slate-900">Nama</div>
                          <div className="col-span-2 font-semibold text-slate-900">Aksi</div>
                        </div>
                        <div className="divide-y">
                          {deductionTemplates.map((item) => (
                            <div key={item.id} className="grid grid-cols-12 p-3 items-center gap-4 bg-white">
                              <div className="col-span-10">
                                <Input 
                                  value={item.name} 
                                  onChange={(e) => handleUpdateDeduction(item.id, e.target.value)}
                                  className="bg-slate-50 border-slate-200" 
                                />
                              </div>
                              <div className="col-span-2">
                                <Button 
                                  onClick={() => handleRemoveDeduction(item.id)}
                                  variant="destructive" 
                                  className="h-10 w-10 rounded-full bg-red-500 hover:bg-red-600 p-0 flex items-center justify-center"
                                >
                                  <Trash2 className="h-5 w-5 text-white" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="flex justify-end gap-2 pt-4 border-t">
                    <Button className="bg-lime-600 hover:bg-lime-700 text-white rounded-full px-6">
                      Selesaikan
                    </Button>
                    <DialogClose asChild>
                      <Button variant="destructive" className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6">
                        Tutup
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Dialog open={addDataOpen} onOpenChange={setAddDataOpen}>
                <DialogTrigger asChild>
                  <Button onClick={handleOpenAddData} className="bg-blue-700 hover:bg-blue-800">
                    <Plus className="mr-2 h-4 w-4" />
                    Tambah Data
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-slate-800">Pendapatan/Potongan Bonus</DialogTitle>
                  </DialogHeader>
                  
                  <div className="py-4 space-y-6">
                    {/* Employee Selector */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-700">Karyawan:</p>
                      <Select value={selectedEmployee} onValueChange={setSelectedEmployee}>
                        <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                          <SelectValue placeholder="Pilih Karyawan" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="01">01 - Nawawi</SelectItem>
                          <SelectItem value="02">02 - Budi</SelectItem>
                          <SelectItem value="03">03 - Charlie</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Pendapatan Bonus Section */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-slate-800">Pendapatan Bonus</h3>
                        <Button onClick={handleAddFormIncome} className="bg-[#0D9488] hover:bg-[#0f766e] text-white rounded-full px-4 h-8 text-sm">
                          <Plus className="mr-1 h-4 w-4" /> Tambah
                        </Button>
                      </div>
                      
                      <div className="border rounded-md overflow-hidden">
                        <div className="grid grid-cols-12 bg-white border-b p-3">
                          <div className="col-span-5 font-semibold text-slate-900">Nama</div>
                          <div className="col-span-5 font-semibold text-slate-900">Jumlah</div>
                          <div className="col-span-2 font-semibold text-slate-900">Aksi</div>
                        </div>
                        <div className="divide-y">
                          {formIncomes.map((item) => (
                            <div key={item.id} className="grid grid-cols-12 p-3 items-center gap-4 bg-white">
                              <div className="col-span-5">
                                <Input 
                                  value={item.name} 
                                  onChange={(e) => handleUpdateFormIncome(item.id, 'name', e.target.value)}
                                  className="bg-slate-50 border-slate-200" 
                                />
                              </div>
                              <div className="col-span-5">
                                <Input 
                                  value={item.amount} 
                                  onChange={(e) => handleUpdateFormIncome(item.id, 'amount', e.target.value)}
                                  className="bg-slate-50 border-slate-200"
                                  placeholder="Rp 0"
                                />
                              </div>
                              <div className="col-span-2">
                                <Button 
                                  onClick={() => handleRemoveFormIncome(item.id)}
                                  variant="destructive" 
                                  className="h-10 w-10 rounded-full bg-red-500 hover:bg-red-600 p-0 flex items-center justify-center"
                                >
                                  <Trash2 className="h-5 w-5 text-white" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Potongan Section */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-slate-800">Potongan</h3>
                        <Button onClick={handleAddFormDeduction} className="bg-[#0D9488] hover:bg-[#0f766e] text-white rounded-full px-4 h-8 text-sm">
                          <Plus className="mr-1 h-4 w-4" /> Tambah
                        </Button>
                      </div>
                      
                      <div className="border rounded-md overflow-hidden">
                        <div className="grid grid-cols-12 bg-white border-b p-3">
                          <div className="col-span-5 font-semibold text-slate-900">Nama</div>
                          <div className="col-span-5 font-semibold text-slate-900">Jumlah</div>
                          <div className="col-span-2 font-semibold text-slate-900">Aksi</div>
                        </div>
                        <div className="divide-y">
                          {formDeductions.map((item) => (
                            <div key={item.id} className="grid grid-cols-12 p-3 items-center gap-4 bg-white">
                              <div className="col-span-5">
                                <Input 
                                  value={item.name} 
                                  onChange={(e) => handleUpdateFormDeduction(item.id, 'name', e.target.value)}
                                  className="bg-slate-50 border-slate-200" 
                                />
                              </div>
                              <div className="col-span-5">
                                <Input 
                                  value={item.amount} 
                                  onChange={(e) => handleUpdateFormDeduction(item.id, 'amount', e.target.value)}
                                  className="bg-slate-50 border-slate-200"
                                  placeholder="Rp 0"
                                />
                              </div>
                              <div className="col-span-2">
                                <Button 
                                  onClick={() => handleRemoveFormDeduction(item.id)}
                                  variant="destructive" 
                                  className="h-10 w-10 rounded-full bg-red-500 hover:bg-red-600 p-0 flex items-center justify-center"
                                >
                                  <Trash2 className="h-5 w-5 text-white" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <DialogFooter className="flex justify-end gap-2 pt-4 border-t">
                    <Button className="bg-lime-600 hover:bg-lime-700 text-white rounded-full px-6">
                      Selesaikan
                    </Button>
                    <DialogClose asChild>
                      <Button variant="destructive" className="bg-red-500 hover:bg-red-600 text-white rounded-full px-6">
                        Tutup
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button className="bg-teal-600 hover:bg-teal-700">
                <Send className="mr-2 h-4 w-4" />
                Kirim Slip Ke Semua
              </Button>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
             <Select value={selectedUnit} onValueChange={setSelectedUnit}>
              <SelectTrigger className="border-blue-200">
                <SelectValue placeholder="Semua Unit Bisnis" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">Semua Unit Bisnis</SelectItem>
                <SelectItem value="PISMART">PISMART</SelectItem>
                <SelectItem value="Laundry">Laundry</SelectItem>
                <SelectItem value="Dapur">Dapur</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="border-blue-200">
                <SelectValue placeholder="Semua Kantor Cabang" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">Semua Kantor Cabang</SelectItem>
                {branchOptions.map((branch) => (
                  <SelectItem key={branch} value={branch}>{branch}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="border-blue-200">
                <SelectValue placeholder="Semua Department" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">Semua Department</SelectItem>
                {departmentOptions.map((dept) => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="border-blue-200">
                <SelectValue placeholder="Bulan" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                {Array.from({ length: 12 }).map((_, i) => (
                  <SelectItem key={i} value={String(i + 1)}>
                    {new Date(0, i).toLocaleString('id-ID', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

             <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="border-blue-200">
                <SelectValue placeholder="Tahun" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-blue-600" />
              <Input 
                placeholder="Cari Data..." 
                className="pl-9 border-blue-200 focus:border-blue-500 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Table Section - Desktop */}
        <div className="hidden md:block rounded-xl border border-blue-100 shadow-sm overflow-hidden bg-white mb-4">
          <Table>
            <TableHeader className="bg-blue-50">
              <TableRow>
                <TableHead className="font-bold text-blue-900">No Karyawan/NIP</TableHead>
                <TableHead className="font-bold text-blue-900">Nama</TableHead>
                <TableHead className="font-bold text-blue-900">Tanggal Pemberian</TableHead>
                <TableHead className="font-bold text-blue-900">Status</TableHead>
                <TableHead className="font-bold text-blue-900 text-right">Total</TableHead>
                <TableHead className="font-bold text-blue-900 text-center">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bonuses.map((bonus) => (
                <TableRow key={bonus._id} className="hover:bg-blue-50/30">
                  <TableCell className="font-medium">{bonus.nip}</TableCell>
                  <TableCell>{bonus.name}</TableCell>
                  <TableCell>{bonus.date}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      bonus.status === 'sent' 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {bonus.status === 'sent' ? 'Terkirim' : 'Draft'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-blue-700">{formatCurrency(bonus.total)}</TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-white">
                        <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile: kartu */}
        <div className="md:hidden mb-4 space-y-3">
          {bonuses.map((bonus) => (
            <div
              key={bonus._id}
              className="rounded-xl border border-blue-100 bg-white shadow-sm p-3 flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-blue-800">{bonus.name}</p>
                  <p className="text-[11px] text-slate-500">NIP: {bonus.nip}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{bonus.date}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex px-2 py-1 rounded-full text-[10px] font-medium ${
                    bonus.status === 'sent' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {bonus.status === 'sent' ? 'Terkirim' : 'Draft'}
                  </span>
                  <p className="mt-2 text-sm font-semibold text-blue-700">
                    {formatCurrency(bonus.total)}
                  </p>
                </div>
              </div>
              <div className="flex justify-end pt-1 border-t border-blue-50 mt-1">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white">
                    <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" /> Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          ))}
          {bonuses.length === 0 && (
            <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50/60 py-10 px-4 text-center text-slate-500 text-sm">
              Tidak ada data bonus
            </div>
          )}
        </div>

        {/* Footer / Pagination */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <Button onClick={handleExportToExcelSimple} variant="outline" className="border-blue-600 text-blue-700 hover:bg-blue-50">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export to Excel
          </Button>

          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">3</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>

      </div>
    </div>
  );
}
