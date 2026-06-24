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
  maGD: number;
  ngayGD: string;
  soTien: number;
  tyLeHoaHong: number;
  tinhTrang: string;
  nhanVien?: { hoTen: string };
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export function AdminThongKePage() {
  const currentYear = new Date().getFullYear();

  // Chế độ xem: 'multi' (5-10 năm) hoặc 'single' (Chi tiết 1 năm)
  const [viewMode, setViewMode] = useState<'multi' | 'single'>('single');
  
  // Khối State cho chế độ xem nhiều năm (5 năm / 10 năm)
  const [multiYearType, setMultiYearType] = useState<5 | 10>(5);
  const [multiYearData, setMultiYearData] = useState<YearlySummary[]>([]);

  // Khối State cho chế độ xem 1 năm cụ thể
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(0); 
  const [singleYearSummary, setSingleYearSummary] = useState<YearlySummary | null>(null);
  const [singleYearChartData, setSingleYearChartData] = useState<ChartData[]>([]);
  const [tableData, setTableData] = useState<GiaoDich[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  // Lắng nghe thay đổi để fetch dữ liệu tương ứng
  useEffect(() => {
    if (viewMode === 'multi') {
      fetchMultiYearData();
    } else {
      fetchSingleYearData();
    }
  }, [viewMode, multiYearType, selectedYear]);

  // Lập lịch fetch bảng chi tiết giao dịch (chỉ chạy ở chế độ xem 1 năm)
  useEffect(() => {
    if (viewMode === 'single') {
      fetchTableData();
    }
  }, [selectedYear, selectedMonth, viewMode]);

  // --- HÀM XỬ LÝ CHẾ ĐỘ XEM 5 NĂM / 10 NĂM ---
  const fetchMultiYearData = async () => {
    setIsLoading(true);
    try {
      // Tính toán danh sách 5 hoặc 10 năm gần đây (về trước tính từ năm hiện tại)
      const yearsList: number[] = [];
      for (let i = multiYearType - 1; i >= 0; i--) {
        yearsList.push(currentYear - i);
      }

      // Kỹ thuật gộp Request bằng Promise.all dựa trên API tổng quan năm của BE
      const requests = yearsList.map(y => http.get(`/thong-ke/tong-quan-nam?year=${y}`));
      const responses = await Promise.all(requests);
      
      const compiledData = responses.map(res => res.data);
      setMultiYearData(compiledData);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải dữ liệu thống kê nhiều năm!');
    } finally {
      setIsLoading(false);
    }
  };

  // --- HÀM XỬ LÝ CHẾ ĐỘ XEM CHI TIẾT 1 NĂM ---
  const fetchSingleYearData = async () => {
    setIsLoading(true);
    try {
      const [summaryRes, chartRes] = await Promise.all([
        http.get(`/thong-ke/tong-quan-nam?year=${selectedYear}`),
        http.get(`/thong-ke/chart?year=${selectedYear}`)
      ]);
      setSingleYearSummary(summaryRes.data);
      setSingleYearChartData(chartRes.data);
    } catch (error) {
      console.error(error);
      toast.error('Không thể tải dữ liệu năm chi tiết!');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTableData = async () => {
    try {
      const res = await http.get(`/thong-ke/giao-dich?year=${selectedYear}&month=${selectedMonth}`);
      setTableData(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const styles = {
    container: { padding: '20px', color: '#fff', width: '100%' },
    card: { backgroundColor: '#1e1f2f', border: '1px solid #2d2e42', borderRadius: '8px' },
    textYellow: { color: '#f8cc46' },
    selectDark: { backgroundColor: '#13141f', color: '#fff', border: '1px solid #2d2e42' },
    tableHeader: { color: '#f8cc46', borderBottom: '1px solid #2d2e42', backgroundColor: 'transparent' },
    tableCell: { color: '#c4c4d4', borderBottom: '1px solid #2d2e42', verticalAlign: 'middle', backgroundColor: 'transparent' },
    tabBtn: (active: boolean) => ({
      backgroundColor: active ? '#f8cc46' : '#1e1f2f',
      color: active ? '#000' : '#fff',
      border: '1px solid #2d2e42',
      fontWeight: 'bold' as const,
      padding: '10px 20px',
      borderRadius: '6px'
    })
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-right" />

      {/* THANH ĐIỀU HƯỚNG TABS CHẾ ĐỘ XEM */}
      <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
        <div className="d-flex gap-2">
          <button 
            style={styles.tabBtn(viewMode === 'single')} 
            onClick={() => setViewMode('single')}
          >
            📊 Chi Tiết Theo Từng Năm
          </button>
          <button 
            style={styles.tabBtn(viewMode === 'multi')} 
            onClick={() => setViewMode('multi')}
          >
            📈 Chu Kỳ Dài Hạn (5 - 10 Năm)
          </button>
        </div>

        {/* BỘ LỌC ĐỘNG THEO TỪNG CHẾ ĐỘ */}
        <div className="d-flex align-items-center gap-2">
          {viewMode === 'multi' ? (
            <>
              <label className="mb-0 text-muted">Chọn chu kỳ:</label>
              <select 
                className="form-select w-auto" 
                style={styles.selectDark}
                value={multiYearType}
                onChange={(e) => setMultiYearType(Number(e.target.value) as 5 | 10)}
              >
                <option value={5}>Giai đoạn 5 năm</option>
                <option value={10}>Giai đoạn 10 năm</option>
              </select>
            </>
          ) : (
            <>
              <label className="mb-0 fw-bold">Chọn năm xem:</label>
              <select 
                className="form-select w-auto" 
                style={styles.selectDark}
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {[currentYear - 4, currentYear - 3, currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map(y => (
                  <option key={y} value={y}>Năm {y}</option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-5"><div className="spinner-border text-warning" /></div>
      ) : (
        <>
          {/* ========================================================= */}
          {/* GIAO DIỆN 1: CHẾ ĐỘ XEM CHU KỲ DÀI HẠN (5 NĂM / 10 NĂM)     */}
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
                    {/* Trục trái cho cột Giá Trị BĐS */}
                    <YAxis yAxisId="left" stroke="#c4c4d4" tickFormatter={(v) => `${(v / 1e9).toFixed(1)} Tỷ`} />
                    {/* Trục phải cho cột Doanh Thu Hoa Hồng */}
                    <YAxis yAxisId="right" orientation="right" stroke="#f8cc46" tickFormatter={(v) => `${(v / 1e6).toFixed(0)} Tr`} />
                    
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e1f2f', borderColor: '#2d2e42', color: '#fff' }}
                      formatter={(value: any) => formatCurrency(Number(value))}
                    />
                    <Legend />
                    
                    {/* Cột thể hiện Giá trị BĐS giao dịch lên xuống từng năm */}
                    <Bar yAxisId="left" dataKey="tongGiaTriBDS" name="Tổng giá trị BĐS bán ra" fill="#17a2b8" radius={[4, 4, 0, 0]} barSize={50} />
                    {/* Cột thể hiện Doanh thu thu về lên xuống từng năm */}
                    <Bar yAxisId="right" dataKey="tongDoanhThu" name="Doanh thu hoa hồng thu về" fill="#f8cc46" radius={[4, 4, 0, 0]} barSize={25} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* GIAO DIỆN 2: CHẾ ĐỘ XEM CHI TIẾT 1 NĂM (12 THÁNG)           */}
          {/* ========================================================= */}
          {viewMode === 'single' && (
            <>
              {/* Thẻ nhỏ hiển thị tổng kết nhanh */}
              <div className="row mb-4">
                <div className="col-md-4 mb-3">
                  <div className="p-4 h-100" style={styles.card}>
                    <h5 className="text-muted mb-2">Tổng Giao Dịch ({selectedYear})</h5>
                    <h2 className="mb-0" style={styles.textYellow}>{singleYearSummary?.tongGiaoDich || 0} <small className="fs-6 text-light fw-normal">giao dịch</small></h2>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="p-4 h-100" style={styles.card}>
                    <h5 className="text-muted mb-2">Tổng Giá Trị BĐS ({selectedYear})</h5>
                    <h2 className="mb-0 text-info">{formatCurrency(singleYearSummary?.tongGiaTriBDS || 0)}</h2>
                  </div>
                </div>
                <div className="col-md-4 mb-3">
                  <div className="p-4 h-100" style={styles.card}>
                    <h5 className="text-muted mb-2">Tổng Doanh Thu ({selectedYear})</h5>
                    <h2 className="mb-0 text-success">{formatCurrency(singleYearSummary?.tongDoanhThu || 0)}</h2>
                  </div>
                </div>
              </div>

              {/* Biểu đồ cột chi tiết 12 tháng */}
              <div className="p-4 mb-4" style={styles.card}>
                <h4 className="mb-4" style={styles.textYellow}>Biểu Đồ So Sánh Các Tháng (1 - 12) Năm {selectedYear}</h4>
                <div style={{ height: '400px', width: '100%' }}>
                  <ResponsiveContainer>
                    <ComposedChart data={singleYearChartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2d2e42" />
                      <XAxis dataKey="thang" stroke="#c4c4d4" />
                      <YAxis yAxisId="left" stroke="#c4c4d4" tickFormatter={(v) => `${v / 1e6}Tr`} />
                      <YAxis yAxisId="right" orientation="right" stroke="#28a745" tickFormatter={(v) => `${v / 1e6}Tr`} />
                      
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#1e1f2f', borderColor: '#2d2e42', color: '#fff' }}
                        formatter={(value: any) => formatCurrency(Number(value))}
                      />
                      <Legend />
                      
                      {/* Cột hiển thị giá trị giao dịch BDS của từng tháng */}
                      <Bar yAxisId="left" dataKey="tongGiaTri" name="Giá trị BĐS bán lẻ" fill="#17a2b8" radius={[4, 4, 0, 0]} />
                      {/* Cột hoặc đường hiển thị Doanh thu để dễ so sánh tương quan */}
                      <Bar yAxisId="right" dataKey="doanhThu" name="Doanh thu hoa hồng" fill="#28a745" radius={[4, 4, 0, 0]} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bảng kê dữ liệu gốc (Giữ nguyên tính năng cũ) */}
              <div className="p-4" style={styles.card}>
                <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                  <h4 className="m-0" style={styles.textYellow}>Danh Sách Bản Ghi Giao Dịch</h4>
                  <div className="d-flex align-items-center gap-2">
                    <label className="mb-0 text-light">Lọc tháng:</label>
                    <select className="form-select form-select-sm w-auto" style={styles.selectDark} value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))}>
                      <option value={0}>Cả năm</option>
                      {Array.from({ length: 12 }, (_, i) => (<option key={i + 1} value={i + 1}>Tháng {i + 1}</option>))}
                    </select>
                  </div>
                </div>
                <div className="table-responsive">
                  <table className="table table-dark table-borderless align-middle mb-0" style={{ backgroundColor: 'transparent' }}>
                    <thead>
                      <tr>
                        <th style={styles.tableHeader}>Mã GD</th>
                        <th style={styles.tableHeader}>Ngày GD</th>
                        <th style={styles.tableHeader}>Nhân viên</th>
                        <th style={styles.tableHeader}>Giá trị BĐS</th>
                        <th style={styles.tableHeader}>Tỷ lệ HH</th>
                        <th style={styles.tableHeader}>Doanh thu thu về</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-4 text-muted">Không có dữ liệu.</td></tr>
                      ) : (
                        tableData.map((gd) => {
                          const tienBDS = Number(gd.soTien);
                          const doanhThu = tienBDS * (gd.tyLeHoaHong / 100);
                          return (
                            <tr key={gd.maGD}>
                              <td style={styles.tableCell}>#{gd.maGD}</td>
                              <td style={styles.tableCell}>{new Date(gd.ngayGD).toLocaleDateString('vi-VN')}</td>
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