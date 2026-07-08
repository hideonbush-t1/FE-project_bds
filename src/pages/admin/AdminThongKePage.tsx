import React, { useState, useEffect } from 'react';
import { http } from '../../api/http';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line
} from 'recharts';
import toast, { Toaster } from 'react-hot-toast';

interface YearlySummary {
  nam: number;
  tongGiaoDich: number;
  tongGiaTriBDS: number;
  tongDoanhThu: number;
}

interface ChartData {
  thang: string;
  soLuong: number;
  tongGiaTri: number;
  doanhThu: number;
}

interface GiaoDich {
  id: string; 
  ngayGD: string;
  soTien: number;
  tyLeHoaHong: number;
  tinhTrang: string;
  nhanVien?: { hoTen: string };
  batDongSan?: { tieuDe: string }; 
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

// Tính toán phần trăm tăng giảm
const calculateTrend = (current: number, previous: number) => {
  if (!previous || previous === 0) {
    if (current > 0) return { percent: '100', isUp: true, color: '#28a745', icon: '▲' };
    return null; 
  }
  const percent = ((current - previous) / previous) * 100;
  const isUp = percent >= 0;
  return {
    percent: Math.abs(percent).toFixed(1),
    isUp,
    color: isUp ? '#28a745' : '#dc3545',
    icon: isUp ? '▲' : '▼'
  };
};

export function AdminThongKePage() {
  const currentYear = new Date().getFullYear();

  // --- STATE CHẾ ĐỘ XEM ---
  const [viewMode, setViewMode] = useState<'single' | 'multi'>('single');
  const [multiYearType, setMultiYearType] = useState<5 | 10>(5);
  const [multiYearData, setMultiYearData] = useState<YearlySummary[]>([]);

  // --- STATE BỘ LỌC (Dành cho chế độ Single) ---
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [compareYear, setCompareYear] = useState<number>(currentYear - 1);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all'); 
  const [selectedNhanVien, setSelectedNhanVien] = useState<string>('all');
  const [dsNhanVien, setDsNhanVien] = useState<{ id: number, hoTen: string }[]>([]);

  // --- STATE DỮ LIỆU SINGLE ---
  const [summary, setSummary] = useState<YearlySummary | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [compareSummary, setCompareSummary] = useState<YearlySummary | null>(null);
  const [compareChartData, setCompareChartData] = useState<ChartData[]>([]);
  const [tableData, setTableData] = useState<GiaoDich[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Lấy danh sách nhân viên 1 lần khi load trang
  useEffect(() => {
    http.get('/nhan-vien').then(res => setDsNhanVien(res.data)).catch(() => {});
  }, []);

  // Lắng nghe thay đổi để tải dữ liệu
  useEffect(() => {
    if (viewMode === 'multi') {
      fetchMultiYearData();
    } else {
      fetchSingleYearData();
    }
  }, [viewMode, multiYearType, selectedYear, compareYear, selectedPeriod, selectedNhanVien]);

  const fetchMultiYearData = async () => {
    setIsLoading(true);
    try {
      const yearsList: number[] = [];
      for (let i = multiYearType - 1; i >= 0; i--) yearsList.push(currentYear - i);

      const requests = yearsList.map(y => http.get(`/thong-ke/tong-quan-nam?year=${y}`));
      const responses = await Promise.all(requests);
      setMultiYearData(responses.map(res => res.data));
    } catch (error) {
      toast.error('Lỗi tải dữ liệu nhiều năm!');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSingleYearData = async () => {
    setIsLoading(true);
    try {
      const queryMain = `year=${selectedYear}&period=${selectedPeriod}&nhanVienId=${selectedNhanVien}`;
      const queryComp = `year=${compareYear}&period=${selectedPeriod}&nhanVienId=${selectedNhanVien}`;
      
      const [sumRes, chartRes, tableRes, compSumRes, compChartRes] = await Promise.all([
        http.get(`/thong-ke/tong-quan-nam?${queryMain}`),
        http.get(`/thong-ke/chart?${queryMain}`),
        http.get(`/thong-ke/giao-dich?${queryMain}`),
        http.get(`/thong-ke/tong-quan-nam?${queryComp}`),
        http.get(`/thong-ke/chart?${queryComp}`)
      ]);
      
      setSummary(sumRes.data);
      setChartData(chartRes.data);
      setTableData(tableRes.data);
      setCompareSummary(compSumRes.data);
      setCompareChartData(compChartRes.data);
    } catch (error) {
      toast.error('Lỗi tải dữ liệu thống kê!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    if (tableData.length === 0) return toast.error('Không có dữ liệu để xuất!');
    const BOM = "\uFEFF";
    // Thêm Tên BĐS vào Header
    const headers = ['Mã GD', 'Ngày GD', 'Tên BĐS', 'Tên Nhân Viên', 'Trạng Thái', 'Giá trị BĐS', 'Tỷ lệ HH (%)', 'Doanh Thu (VNĐ)'];
    const rows = tableData.map(gd => [
      gd.id, // Đổi từ gd.maGD sang gd.id
      new Date(gd.ngayGD).toLocaleDateString('vi-VN'),
      `"${gd.batDongSan?.tieuDe || 'N/A'}"`, // Thêm trường Tên BĐS
      `"${gd.nhanVien?.hoTen || 'N/A'}"`,
      gd.tinhTrang,
      Number(gd.soTien),
      gd.tyLeHoaHong,
      Number(gd.soTien) * (gd.tyLeHoaHong / 100)
    ].join(','));
    
    const csvContent = BOM + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Thong_Ke_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Xuất CSV thành công!');
  };

  // Trộn Data cho biểu đồ kép
  const combinedChartData = chartData.map((item, index) => ({
    thang: item.thang,
    doanhThuHienTai: item.doanhThu,
    doanhThuSoSanh: compareChartData[index]?.doanhThu || 0,
    tongGiaTri: item.tongGiaTri, 
  }));

  const trendGiaoDich = calculateTrend(summary?.tongGiaoDich || 0, compareSummary?.tongGiaoDich || 0);
  const trendGiaTri = calculateTrend(summary?.tongGiaTriBDS || 0, compareSummary?.tongGiaTriBDS || 0);
  const trendDoanhThu = calculateTrend(summary?.tongDoanhThu || 0, compareSummary?.tongDoanhThu || 0);

  const styles = {
    container: { padding: '20px', color: '#fff', width: '100%' },
    card: { backgroundColor: '#1e1f2f', border: '1px solid #2d2e42', borderRadius: '8px' },
    textYellow: { color: '#f8cc46' },
    selectDark: { backgroundColor: '#13141f', color: '#fff', border: '1px solid #2d2e42' },
    tableHeader: { color: '#f8cc46', borderBottom: '1px solid #2d2e42', backgroundColor: 'transparent' },
    tableCell: { color: '#c4c4d4', borderBottom: '1px solid #2d2e42', verticalAlign: 'middle', backgroundColor: 'transparent' },
    tabBtn: (active: boolean) => ({
      backgroundColor: active ? '#f8cc46' : '#1e1f2f', color: active ? '#000' : '#fff',
      border: '1px solid #2d2e42', fontWeight: 'bold' as const, padding: '10px 20px', borderRadius: '6px'
    })
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />

      {/* HEADER & TABS */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div className="d-flex gap-2">
          <button style={styles.tabBtn(viewMode === 'single')} onClick={() => setViewMode('single')}>
            📊 Chi Tiết & So Sánh Năm
          </button>
          <button style={styles.tabBtn(viewMode === 'multi')} onClick={() => setViewMode('multi')}>
            📈 Chu Kỳ Dài Hạn (5-10 Năm)
          </button>
        </div>
      </div>

      {/* VÙNG FILTER */}
      <div className="p-3 mb-4 rounded d-flex align-items-center gap-3 flex-wrap" style={{ backgroundColor: '#1e1f2f', border: '1px solid #2d2e42' }}>
        {viewMode === 'multi' ? (
          <div className="d-flex align-items-center gap-2">
            <label className="mb-0 text-light fw-bold">Chọn chu kỳ xem:</label>
            <select className="form-select w-auto" style={styles.selectDark} value={multiYearType} onChange={(e) => setMultiYearType(Number(e.target.value) as 5 | 10)}>
              <option value={5}>Giai đoạn 5 năm</option>
              <option value={10}>Giai đoạn 10 năm</option>
            </select>
          </div>
        ) : (
          <>
            <div className="d-flex align-items-center gap-2">
              <label className="mb-0 text-light fw-bold">Nhân viên:</label>
              <select className="form-select form-select-sm" style={styles.selectDark} value={selectedNhanVien} onChange={e => setSelectedNhanVien(e.target.value)}>
                <option value="all">Tất cả nhân viên</option>
                {dsNhanVien.map(nv => <option key={nv.id} value={nv.id}>{nv.hoTen}</option>)}
              </select>
            </div>
            <div className="d-flex align-items-center gap-2">
              <label className="mb-0 text-light fw-bold">Chu kỳ:</label>
              <select className="form-select form-select-sm" style={styles.selectDark} value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value)}>
                <option value="all">Cả năm</option>
                <option value="nua-dau">6 Tháng Đầu Năm</option>
                <option value="nua-sau">6 Tháng Cuối Năm</option>
                <option value="quy-1">Quý 1</option><option value="quy-2">Quý 2</option><option value="quy-3">Quý 3</option><option value="quy-4">Quý 4</option>
                {Array.from({ length: 12 }, (_, i) => (<option key={i+1} value={`thang-${i+1}`}>Tháng {i + 1}</option>))}
              </select>
            </div>
            <div className="d-flex align-items-center gap-2">
              <label className="mb-0 text-light fw-bold">So sánh với:</label>
              <select className="form-select form-select-sm" style={styles.selectDark} value={compareYear} onChange={e => setCompareYear(Number(e.target.value))}>
                {[currentYear - 2, currentYear - 1, currentYear].map(y => <option key={`cmp-${y}`} value={y}>{y}</option>)}
              </select>
            </div>
            <div className="d-flex align-items-center gap-2">
              <label className="mb-0 fw-bold" style={styles.textYellow}>Năm Hiện Tại:</label>
              <select className="form-select form-select-sm" style={{...styles.selectDark, borderColor: '#f8cc46'}} value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))}>
                {[currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-5"><div className="spinner-border text-warning" /></div>
      ) : (
        <>
          {/* ========================================================= */}
          {/* GIAO DIỆN CHU KỲ DÀI HẠN (5-10 NĂM)                         */}
          {/* ========================================================= */}
          {viewMode === 'multi' && (
            <div className="p-4" style={styles.card}>
              <h4 className="mb-4" style={styles.textYellow}>
                Biểu Đồ Doanh Thu & Giá Trị BĐS Giai Đoạn {multiYearData[0]?.nam} - {multiYearData[multiYearData.length - 1]?.nam}
              </h4>
              <div style={{ height: '450px', width: '100%' }}>
                <ResponsiveContainer>
                  <ComposedChart data={multiYearData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2d2e42" />
                    <XAxis dataKey="nam" stroke="#c4c4d4" tickFormatter={(v) => `Năm ${v}`} />
                    <YAxis yAxisId="left" stroke="#c4c4d4" tickFormatter={(v) => `${(v / 1e9).toFixed(1)} Tỷ`} />
                    <YAxis yAxisId="right" orientation="right" stroke="#f8cc46" tickFormatter={(v) => `${(v / 1e6).toFixed(0)} Tr`} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e1f2f', borderColor: '#2d2e42', color: '#fff' }} formatter={(value: any) => formatCurrency(Number(value))} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="tongGiaTriBDS" name="Tổng giá trị BĐS bán ra" fill="#17a2b8" radius={[4, 4, 0, 0]} barSize={50} />
                    <Bar yAxisId="right" dataKey="tongDoanhThu" name="Doanh thu hoa hồng thu về" fill="#f8cc46" radius={[4, 4, 0, 0]} barSize={25} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* GIAO DIỆN CHI TIẾT 1 NĂM (KÈM SO SÁNH Y-O-Y)                */}
          {/* ========================================================= */}
          {viewMode === 'single' && (
            <>
              {/* CARDS TỔNG QUAN */}
              <div className="row mb-4">
                <div className="col-md-4 mb-3">
                  <div className="p-4 h-100 d-flex flex-column justify-content-center" style={styles.card}>
                    <h5 className="mb-2" style={{ color: '#c4c4d4', fontWeight: 500 }}>Tổng Giao Dịch ({selectedYear})</h5>
                    <h2 className="mb-1" style={styles.textYellow}>{summary?.tongGiaoDich || 0} <small className="fs-6 fw-normal" style={{color: '#c4c4d4'}}>giao dịch</small></h2>
                    {trendGiaoDich && (
                      <span style={{ color: trendGiaoDich.color, fontSize: '14px', fontWeight: 'bold' }}>
                        {trendGiaoDich.icon} {trendGiaoDich.percent}% so với {compareYear}
                      </span>
                    )}
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="p-4 h-100 d-flex flex-column justify-content-center" style={styles.card}>
                    <h5 className="mb-2" style={{ color: '#c4c4d4', fontWeight: 500 }}>Tổng Giá Trị BĐS ({selectedYear})</h5>
                    <h2 className="mb-1 text-info">{formatCurrency(summary?.tongGiaTriBDS || 0)}</h2>
                    {trendGiaTri && (
                      <span style={{ color: trendGiaTri.color, fontSize: '14px', fontWeight: 'bold' }}>
                        {trendGiaTri.icon} {trendGiaTri.percent}% so với {compareYear}
                      </span>
                    )}
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="p-4 h-100 d-flex flex-column justify-content-center" style={styles.card}>
                    <h5 className="mb-2" style={{ color: '#c4c4d4', fontWeight: 500 }}>Tổng Doanh Thu ({selectedYear})</h5>
                    <h2 className="mb-1 text-success">{formatCurrency(summary?.tongDoanhThu || 0)}</h2>
                    {trendDoanhThu && (
                      <span style={{ color: trendDoanhThu.color, fontSize: '14px', fontWeight: 'bold' }}>
                        {trendDoanhThu.icon} {trendDoanhThu.percent}% so với {compareYear}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* BIỂU ĐỒ KÉP SO SÁNH */}
              <div className="p-4 mb-4" style={styles.card}>
                <h4 className="mb-4" style={styles.textYellow}>So sánh Doanh Thu: {selectedYear} vs {compareYear}</h4>
                <div style={{ height: '400px', width: '100%' }}>
                  <ResponsiveContainer>
                    <ComposedChart data={combinedChartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2d2e42" />
                      <XAxis dataKey="thang" stroke="#c4c4d4" />
                      <YAxis yAxisId="left" stroke="#c4c4d4" tickFormatter={(v) => `${v / 1e6}Tr`} />
                      <YAxis yAxisId="right" orientation="right" stroke="#f8cc46" tickFormatter={(v) => `${v / 1e6}Tr`} />
                      
                      <Tooltip contentStyle={{ backgroundColor: '#1e1f2f', borderColor: '#2d2e42', color: '#fff' }} formatter={(value: any) => formatCurrency(Number(value))} />
                      <Legend />
                      
                      <Bar yAxisId="left" dataKey="tongGiaTri" name={`Giá trị BĐS (${selectedYear})`} fill="#17a2b8" radius={[4, 4, 0, 0]} barSize={40} />
                      <Line yAxisId="right" type="monotone" dataKey="doanhThuHienTai" name={`Doanh thu (${selectedYear})`} stroke="#f8cc46" strokeWidth={4} dot={{ r: 5 }} />
                      <Line yAxisId="right" type="monotone" dataKey="doanhThuSoSanh" name={`Doanh thu (${compareYear})`} stroke="#8a8a9e" strokeWidth={3} strokeDasharray="5 5" />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* BẢNG CHI TIẾT & XUẤT CSV */}
              <div className="p-4" style={styles.card}>
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <h4 className="m-0" style={styles.textYellow}>Danh Sách Bản Ghi Giao Dịch</h4>
                  <button className="btn btn-success" onClick={handleExportCSV}>
                    <i className="bi bi-download me-2"></i> Xuất CSV Báo Cáo
                  </button>
                </div>

                <div className="table-responsive">
                  <table className="table table-dark table-borderless align-middle mb-0" style={{ backgroundColor: 'transparent' }}>
                    <thead>
                      <tr>
                        <th style={styles.tableHeader}>Mã GD</th>
                        <th style={styles.tableHeader}>Ngày GD</th>
                        <th style={styles.tableHeader}>Tên BĐS</th> {/* Thêm cột Tên BĐS */}
                        <th style={styles.tableHeader}>Nhân viên</th>
                        <th style={styles.tableHeader}>Giá trị BĐS</th>
                        <th style={styles.tableHeader}>Tỷ lệ HH</th>
                        <th style={styles.tableHeader}>Doanh thu thu về</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.length === 0 ? (
                        <tr><td colSpan={7} className="text-center py-4 text-muted">Không có dữ liệu.</td></tr>
                      ) : (
                        tableData.map((gd) => {
                          const tienBDS = Number(gd.soTien);
                          const doanhThu = tienBDS * (gd.tyLeHoaHong / 100);
                          return (
                            <tr key={gd.id}>
                              {/* Cắt ngắn ID nếu nó là UUID dài để bảng hiển thị đẹp hơn */}
                              <td style={styles.tableCell}>#{String(gd.id || '').substring(0, 6).toUpperCase()}</td>
                              <td style={styles.tableCell}>{new Date(gd.ngayGD).toLocaleDateString('vi-VN')}</td>
                              
                              {/* Cột hiển thị Tên BĐS */}
                              <td style={{...styles.tableCell, maxWidth: '200px'}} className="text-truncate" title={gd.batDongSan?.tieuDe}>
                                {gd.batDongSan?.tieuDe || 'N/A'}
                              </td>
                              
                              <td style={styles.tableCell}>{gd.nhanVien?.hoTen || 'N/A'}</td>
                              <td style={styles.tableCell} className="text-info">{formatCurrency(tienBDS)}</td>
                              <td style={styles.tableCell}>{gd.tyLeHoaHong}%</td>
                              <td style={styles.tableCell} className="text-success fw-bold">{formatCurrency(doanhThu)}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}