import { useEffect, useState } from "react";
import Lnb from "../include/Lnb";
import Top from "../include/Top";
import { Wrapper, DflexColumn, Content, Ctap } from "../styled/Sales.styles";
import { SpaceBetween, Center, Dflex, PageTotal } from "../styled/Component.styles";
import { Container, Row, Col, Table, Button, Modal, Form, Pagination } from "react-bootstrap";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const API_BASE = "http://localhost:9500";

//구매자재
type PurchaseMaterial = {
id:number; purchaseDate:string; purchaseNo:string;  supplierCode:string;
supplierName:string; itemCode:string; itemName:string; qty:number;
unitPrice:number; amount:number; expectedDate:string; status:string; remark:string;
}

type PageResponse<T> = {
content:T[]; totalElements:number; totalPages:number; number:number; size:number;
}

const TABLE_HEADERS = [
  { key: "purchaseDate", label: "구매일자" },
  { key: "purchaseNo", label: "구매번호" },
  { key: "supplierCode", label: "공급처코드" },
  { key: "supplierName", label: "공급처명" },
  { key: "itemCode", label: "품목코드" },
  { key: "itemName", label: "품목명" },
  { key: "qty", label: "수량" },
  { key: "unitPrice", label: "단가" },
  { key: "amount", label: "금액" },
  { key: "expectedDate", label: "입고예정일" },
  { key: "status", label: "상태" },
  { key: "remark", label: "비고" },
];

const PurchaseMaterial = () => {
const [rows, setRows] = useState<PurchaseMaterial[]>([]); //화면에 보여줄 목록 데이터
const [page, setPage] = useState(0);//현재 페이지 번호 (0부터 시작)
const [size] = useState(10);//한 페이지에 보여줄 개수 (지금은 10으로 고정)
const [totalPages, setTotalPages] = useState(0);//전체 페이지 수
const [totalElements, setTotalElements] = useState(0);//전체 데이터수

//등록모달
const [showCreate, setShowCreate] = useState(false);
const [createForm, setCreateForm] = useState({
purchaseDate:"",purchaseNo:"",supplierCode:"",supplierName:"",itemCode:"",itemName:"",qty:"",
unitPrice:"",expectedDate:"",status:"대기",remark:"",
});

//상세(수정/삭제)모달
const[showDetail, setShowDetail] = useState(false);
const[selected, setSelected] = useState<PurchaseMaterial|null>(null);
const[editForm, setEditForm] = useState({
purchaseDate:"",purchaseNo:"",supplierCode:"",supplierName:"",itemCode:"",itemName:"",qty:"",
unitPrice:"",expectedDate:"",status:"",remark:"",
});

//(e: React.ChangeEvent<any>) e는 입력창에서 무언가 바뀔 때 생기는 정보 묶음 키보드로 글자를 치면 이 함수가 호출됨
const onCreateChange = (e:React.ChangeEvent<any>) => {
    const {name, value} = e.target;//name → "itemName" (어떤 항목인지) value → "guswo" (지금 입력한 값)
    setCreateForm((prev) => ({...prev,[name]:value}));
/*
prev → 기존에 있던 입력값들
...prev → 기존 값은 그대로 유지
[name]: value → 바뀐 항목만 새 값으로 교체
*/
}

const onEditChange = (e:React.ChangeEvent<any>) => {
    const {name, value} = e.target;
    setEditForm((prev) => ({...prev,[name]:value}));
}

//목록조회 (페이징)
const fetchList = async (p:number) => {
//p → 몇 페이지를 가져올지 async → 서버랑 통신하니까 기다렸다가 결과를 받겠다는 뜻
    try{
const res = await fetch(`${API_BASE}/api/purchase/materials?page=${p}&size=${size}`);
//page=${p} → 몇 번째 페이지 size=${size} → 한 페이지에 몇 개
if(!res.ok) throw new Error("서버오류")//서버 응답이 정상인지 확인
const data: PageResponse<PurchaseMaterial> = await res.json();
setRows(data.content);
setTotalPages(data.totalPages);
setTotalElements(data.totalElements);
    }catch (err) {
console.error("구매자재 목록 조회실패", err);
    }
};

useEffect(() => {
fetchList(page);
}, [page]);

const goPage = (p: number) => {
    const next = Math.max(0, Math.min(p, totalPages - 1));
    setPage(next);
  };

//엑셀 다운로드
// ✅ 엑셀 다운로드
  const handleExcelDownload = () => {
    const excelData: (string | number)[][] = [
      ["#", ...TABLE_HEADERS.map((h) => h.label)],
      ...rows.map((r, idx) => [
        idx + 1 + page * size,
        r.purchaseDate,
        r.purchaseNo,
        r.supplierCode,
        r.supplierName,
        r.itemCode,
        r.itemName,
        r.qty,
        r.unitPrice,
        r.amount,
        r.expectedDate,
        r.status,
        r.remark,
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "구매자재관리");

    const excelFile = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelFile], { type: "application/octet-stream" });
    saveAs(blob, "구매자재관리_리스트.xlsx");
  };

  //등록저장
const handleSave = async () => {//“저장 버튼 누르면 실행”
    //구매번호 자동생성
const newPurchaseNo = createForm.purchaseNo?.trim() ? createForm.purchaseNo.trim():`PO-${Date.now()}`
//✅ 사용자가 구매번호를 직접 입력했으면 그걸 쓰고, ✅ 입력 안 했으면 자동으로 만들어서 쓰는 거야.
//createForm.purchaseNo?.trim() ?. = purchaseNo가 없을 수도 있으니 에러 안 나게 안전하게 접근
//trim() = 앞뒤 공백 제거 (예: " PO-1 " → "PO-1")



const qty:number = Number(createForm.qty || 0);
/*수량(qty)과 단가(unitPrice)를 숫자로 바꾸기
input에서 받은 값은 보통 "10" 같은 문자열(string) 이거든 계산(곱하기 등)하려면 숫자(number) 로 바꿔야 함
createForm.qty || 0 qty가 비어있으면("", null, undefined) → 0으로 처리
*/
const unitPrice: number = Number(createForm.unitPrice) || 0;
const amount = qty * unitPrice;

const res = await fetch(`${API_BASE}/api/purchase/materials`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ 
purchaseDate:createForm.purchaseDate,
purchaseNo:newPurchaseNo,
supplierCode:createForm.supplierCode,
supplierName:createForm.supplierName,
itemCode:createForm.itemCode,
itemName:createForm.itemName,
qty,
unitPrice,
amount,
expectedDate:createForm.expectedDate,
status:createForm.status || "대기",
remark:createForm.remark || "",
  }),
});

if(!res.ok){
  const raw = await res.text().catch(() => "");
  alert(raw || "등록실패");
  return;
}

setShowCreate(false);
//현재 페이지 재조회
fetchList(page);
//폼초기화
setCreateForm({
purchaseDate:"",
purchaseNo:"",
supplierCode:"",
supplierName:"",
itemCode:"",
itemName:"",
qty:"",
unitPrice:"",
expectedDate:"",
status:"대기",
remark:"",
});
}

  //상세열기
 const openDetail = async (id: number) => {
    const res = await fetch(`${API_BASE}/api/purchase/materials/${id}`);
    if (!res.ok) throw new Error("상세 조회 실패");

    const data: PurchaseMaterial = await res.json();
    setSelected(data);

    setEditForm({
      purchaseDate: data.purchaseDate || "",
      purchaseNo: data.purchaseNo || "",
      supplierCode: data.supplierCode || "",
      supplierName: data.supplierName || "",
      itemCode: data.itemCode || "",
      itemName: data.itemName || "",
      qty: String(data.qty ?? ""),
      unitPrice: String(data.unitPrice ?? ""),
      expectedDate: data.expectedDate || "",
      status: data.status || "",
      remark: data.remark || "",
    });

    setShowDetail(true);
  };

  //수정저장
const handleUpdate = async () => {
    if (!selected) return;

    const qty = Number(editForm.qty || 0);
    const unitPrice = Number(editForm.unitPrice || 0);
    const amount = qty * unitPrice;

    const res = await fetch(`${API_BASE}/api/purchase/materials/${selected.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...editForm,
        qty,
        unitPrice,
        amount,
      }),
    });

    if (!res.ok) throw new Error("수정 실패");

    setShowDetail(false);
    fetchList(page);
  };

  //삭제
  const handleDelete = async () => {
    if (!selected) return;

    const ok = window.confirm("정말 삭제 할까요?");
    if (!ok) return;

    const res = await fetch(`${API_BASE}/api/purchase/materials/${selected.id}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("삭제 실패");

    setShowDetail(false);

    // 삭제 후 페이지 범위 보정(현재 페이지가 마지막이고 데이터가 줄면 totalPages 변동될 수 있음)
    // 일단 현재 페이지 재조회
    fetchList(page);
  };
    return(
        <>
<Wrapper>
    <Lnb/>
    <DflexColumn>
        <Content>
            <Top/>
        </Content>
        <Container fluid className="p-0">
            <Row>
                <Col>
                <Ctap>
                    <SpaceBetween>
                        <h4>구매자재관리</h4>
                        <Dflex>
<Button className="mx-2 my-3" onClick={handleExcelDownload} variant="success">엑셀다운로드</Button>
<Button className="my-3" onClick={() => setShowCreate(true)} >구매등록</Button>                            
                        </Dflex>
                    </SpaceBetween>
<Table bordered hover>
    <thead>
        <tr className="text-center">
            <th>#</th>
            {TABLE_HEADERS.map((h) => (
                <th key={h.key as string}>{h.label}</th>
            ))}
        </tr>
    </thead>
    <tbody>
{(rows || []).map((r, i) => (
<tr key={r.id ?? i} className="text-center">
<td>{i + 1 + page * size}</td>
<td>{r.purchaseDate}</td>
<td>
<span
onClick={() => openDetail(r.id)}
>
{r.purchaseNo}
</span>
</td>
<td>{r.supplierCode}</td>
<td>{r.supplierName}</td>
<td>{r.itemCode}</td>
<td>{r.itemName}</td>
<td>{r.qty}</td>
<td>{r.unitPrice}</td>
<td>{r.amount}</td>
<td>{r.expectedDate}</td>
<td>{r.status}</td>
<td>{r.remark}</td>
        </tr>
        ))}
    </tbody>
</Table>

<Center>
{totalPages > 0 && (
//totalPages가 0이면(데이터가 없거나 아직 못 가져옴) 👉 페이지 버튼을 아예 안 보여줘.
//totalPages가 1 이상이면 👉 페이지 버튼을 보여줘.
<Pagination>
<Pagination.First disabled={page === 0} onClick={() => goPage(0)}/>

<Pagination.Prev disabled={page === 0} onClick={() => goPage(page - 1)}/>
{Array.from({length:totalPages})
.map((_, i) => i).filter((i) => i >= page -2 && i <= page + 2)
.map((i) => (
<Pagination.Item key={i} active={i === page} onClick={() => goPage(i)}>
{i+1}
</Pagination.Item>
))}
<Pagination.Next disabled={page >= totalPages - 1} onClick={() => goPage(page + 1)}/>
<Pagination.Last disabled={page >= totalPages - 1} onClick={() => goPage(totalPages - 1)}/>
</Pagination>
)}
<PageTotal>
총{totalElements}건 {page + 1} / {totalPages || 1} 페이지
</PageTotal>
</Center>

                </Ctap>
                </Col>
            </Row>
        </Container>
    </DflexColumn>
</Wrapper>

{/* ✅ 등록 모달 */}
                  <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
                    <Modal.Header closeButton>
                      <Modal.Title>구매 등록</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                      <Form>
                        <Form.Control className="mb-2" type="date" name="purchaseDate" value={createForm.purchaseDate} onChange={onCreateChange} />

                        <Form.Control className="mb-2" name="purchaseNo" placeholder="구매번호(비우면 자동생성)" value={createForm.purchaseNo} onChange={onCreateChange} />

                        <Form.Control className="mb-2" name="supplierCode" placeholder="공급처코드" value={createForm.supplierCode} onChange={onCreateChange} />
                        <Form.Control className="mb-2" name="supplierName" placeholder="공급처명" value={createForm.supplierName} onChange={onCreateChange} />

                        <Form.Control className="mb-2" name="itemCode" placeholder="품목코드" value={createForm.itemCode} onChange={onCreateChange} />
                        <Form.Control className="mb-2" name="itemName" placeholder="품목명" value={createForm.itemName} onChange={onCreateChange} />

                        <Form.Control className="mb-2" type="number" name="qty" placeholder="수량" value={createForm.qty} onChange={onCreateChange} />
                        <Form.Control className="mb-2" type="number" name="unitPrice" placeholder="단가" value={createForm.unitPrice} onChange={onCreateChange} />

                        <Form.Control className="mb-2" type="date" name="expectedDate" value={createForm.expectedDate} onChange={onCreateChange} />

                        <Form.Select className="mb-2" name="status" value={createForm.status} onChange={onCreateChange}>
                          <option value="대기">대기</option>
                          <option value="진행">진행</option>
                          <option value="완료">완료</option>
                        </Form.Select>

                        <Form.Control className="mb-2" name="remark" placeholder="비고" value={createForm.remark} onChange={onCreateChange} />
                      </Form>
                    </Modal.Body>

                    <Modal.Footer>
                      <Button variant="secondary" onClick={() => setShowCreate(false)}>
                        닫기
                      </Button>
                      <Button onClick={handleSave}>저장</Button>
                    </Modal.Footer>
                  </Modal>

                  {/* ✅ 상세(수정/삭제) 모달 */}
      <Modal show={showDetail} onHide={() => setShowDetail(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>구매 상세</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Control className="mb-2" type="date" name="purchaseDate" value={editForm.purchaseDate} onChange={onEditChange} />

            {/* 구매번호는 보통 수정 막음 */}
            <Form.Control className="mb-2" name="purchaseNo" value={editForm.purchaseNo} disabled />

            <Form.Control className="mb-2" name="supplierCode" placeholder="공급처코드" value={editForm.supplierCode} onChange={onEditChange} />
            <Form.Control className="mb-2" name="supplierName" placeholder="공급처명" value={editForm.supplierName} onChange={onEditChange} />

            <Form.Control className="mb-2" name="itemCode" placeholder="품목코드" value={editForm.itemCode} onChange={onEditChange} />
            <Form.Control className="mb-2" name="itemName" placeholder="품목명" value={editForm.itemName} onChange={onEditChange} />

            <Form.Control className="mb-2" type="number" name="qty" placeholder="수량" value={editForm.qty} onChange={onEditChange} />
            <Form.Control className="mb-2" type="number" name="unitPrice" placeholder="단가" value={editForm.unitPrice} onChange={onEditChange} />

            <Form.Control className="mb-2" type="date" name="expectedDate" value={editForm.expectedDate} onChange={onEditChange} />

            <Form.Select className="mb-2" name="status" value={editForm.status} onChange={onEditChange}>
              <option value="대기">대기</option>
              <option value="진행">진행</option>
              <option value="완료">완료</option>
            </Form.Select>

            <Form.Control className="mb-2" name="remark" placeholder="비고" value={editForm.remark} onChange={onEditChange} />
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="danger" onClick={handleDelete}>
            삭제
          </Button>
          <Button variant="success" onClick={handleUpdate}>
            수정 저장
          </Button>
        </Modal.Footer>
      </Modal>
        </>
    )
}

export default PurchaseMaterial;