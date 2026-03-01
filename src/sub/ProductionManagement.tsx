import { useEffect, useState } from "react";
import Lnb from "../include/Lnb";
import Top from "../include/Top";
import { Wrapper, DflexColumn, DflexColumn2, Content, Ctap, } from "../styled/Sales.styles";
import {SpaceBetween, Center, Dflex, PageTotal} from "../styled/Component.styles"
import { Container, Row, Col, Tab, Tabs, Table, Button, Modal, Form, Pagination,  } 
from "react-bootstrap";

import * as XLSX from "xlsx";
import {saveAs} from "file-saver";

const API_BASE = "http://localhost:9500"; //기본url을 변경이나 간략히 사용하기 위해서

type ProductionOrder = {//생산지시서 한 건의 정보 구조”**를 정의
id:number;//추가됨
orderDate: string; workOrderNo:string; itemCode:string; itemName:string; planQty:number;
startDate:string; endDate:string; status:string;
}

type PageResponse<T> = {//목록 데이터를 페이지 단위로 받을 때 쓰는 공통 형식
//<T> 아무 타입이나 들어올 수 있는 자리
content:T[]; totalElements:number; totalPages:number;
number:number; size:number;
}

const ProductionManagement = () => {

    const[rows, setRows] = useState<ProductionOrder[]>([]);
//서버에서 받아온 생산지시 데이터를 화면에 뿌리기 위해
    const[page, setPage] = useState(0);
//페이지 이동(다음 / 이전)을 하기 위해
    const[size] = useState(10);
//한 페이지에 보여줄 개수 서버에 “10개씩 주세요”라고 요청하기 위해
    const[totalPages, setTotalPages] =useState(0);
//마지막 페이지인지 판단 페이지 버튼(1, 2, 3 …) 만들 때 필요
    const [showCreate, setShowCreate] = useState(false);
//등록 화면(모달/폼)을 보여줄지 말지
    const [form, setForm] = useState({
orderDate:"", itemCode:"", itemName:"", planQty:"", startDate:"", endDate:"", workOrderNo:""       
    })
//사용자가 입력 중인 생산지시 데이터 입력값을 저장,입력 중에도 값 유지, 저장 버튼 클릭 시 서버로 전송 

const [showDetail, setShowDetail] = useState(false);
const [selected, setSelected] = useState<ProductionOrder | null>(null);

//수정용 폼(상세를 열었을때 채워짐)
const [editForm, setEditForm] = useState({
  orderDate:"",
  workOrderNo:"",
  itemCode:"",
  itemName:"",
  planQty:"",
  startDate:"",
  endDate:"",
  status:"",
})


const handleChange = (e:React.ChangeEvent<any>) => {
/*input 값이 바뀔 때 실행되는 함수
e는 “무슨 입력창이, 어떤 값으로 바뀌었는지”에 대한 정보예요.
👉 form 상태 업데이트
이게 무슨 뜻이냐면:
1️⃣ prev
→ 기존에 입력되어 있던 form 값
2️⃣ { ...prev }
→ 기존 값은 그대로 복사
3️⃣ [name]: value
→ 바뀐 입력값만 덮어쓰기

✔ 입력창이 여러 개여도 함수 하나로 처리 가능
✔ 어떤 입력창이 바뀌었는지 자동으로 구분
✔ 기존 값 안 날아감

입력창(name)에 맞는 form 값을 value로 바꿔주는 공용 함수
*/
const {name, value} = e.target;
setForm((prev) => ({...prev, [name]:value }));
}

/*
생산 지시 목록 조회
👉 생산지시 목록을 서버에서 가져오는 함수
👉 p를 안 넘기면 현재 페이지(page) 사용

👉 서버에 요청 보내기
page : 몇 번째 페이지인지
size : 한 페이지에 몇 개 가져올지

👉 서버 응답(JSON)을 자바스크립트 객체로 변환
👉 형태는 PageResponse + ProductionOrder
*/
const fetchOrders = async (p: number) => {//
  try {
    const res = await fetch(`${API_BASE}/api/production/orders?page=${p}&size=${size}`);
    if (!res.ok) throw new Error("서버 오류");

    const data:PageResponse<ProductionOrder> = await res.json();
    //setRows(data.content || data); 
    setRows(data.content); 
    //setPage(data.number || 0);
    setTotalPages(data.totalPages);
  } catch (err) {
    console.error("생산지시 목록 조회 실패", err);
  }
};
// 2) page가 바뀔 때마다 조회
useEffect(() => {
    fetchOrders(page);
}, [page]);// ✅ page 의존성


//상세불러오는 함수
const openDetail = async (id:number) => {

  const res = await fetch(`${API_BASE}/api/production/orders/${id}`);
  if (!res.ok) throw new Error("상세 조회 실패");

  const data : ProductionOrder = await res.json();
/*
응답 body(서버가 준 데이터)를 JSON으로 파싱해서 JS 객체로 바꾸는 부분이에요.
await res.json()도 시간이 걸릴 수 있어요. (body 읽고 파싱해야 해서)
*/
 setSelected(data)//React state 업데이트.

 //아래 수정폼에 미리 값 채우기
 setEditForm({ //data.xxx || "" data.orderDate가 값이 있으면 그 값을 쓰고, 
 // 값이 없거나(예: undefined, null, "" 같은 falsy)면 빈 문자열 ""을 넣어요.
  orderDate: data.orderDate || "",
  workOrderNo: data.workOrderNo || "",
  itemCode : data.itemCode || "",
  itemName: data.itemName || "",
  planQty: String(data.planQty ?? ""),
  startDate: data.startDate || "",
  endDate : data.endDate || "",
  status: data.status || "",

 });

setShowDetail(true);
}

//수정함수
const handleUpdate = async () => {
  if (!selected) return; //👉 지금 선택된 데이터가 없으면 아무 것도 하지 않고 종료

  const res = await fetch (`${API_BASE}/api/production/orders/${selected.id}`,{
    method:"PUT",headers:{"Content-type":"application/json"},//👉 “JSON 형식으로 보낼게요” 라고 서버에 알려줌
    body:JSON.stringify({
      ...editForm,
      planQty:Number(editForm.planQty),//👉 수정 폼에 입력한 값들을 서버로 전송 👉 planQty는 문자 → 숫자로 바꿔서 보냄
    }),
  })
  if(!res.ok) throw new Error("수정 실패");

  setShowDetail(false);
  fetchOrders(page);//👉 상세창 닫고 👉 현재 페이지 목록 다시 불러오기 (수정 내용 반영)
  //👉 서버에 “이 데이터 수정할게요” 라고 요청 $템플릿 리터럴
}

//삭제
const handleDelete = async () => {
  if (!selected) return; //선택된 데이터 없으면 종료

  const ok = window.confirm("정말 삭제 할까요?");
  if (!ok) return;
  /*
  👉 “진짜 삭제할까요?” 확인창 띄우기 👉 취소 누르면 아무 것도 안 함
  */

  const res = await fetch(`${API_BASE}/api/production/orders/${selected.id}`,{
    method:"DELETE",
  })

  if(!res.ok) throw new Error("삭제 실패");

  setShowDetail(false);
  fetchOrders(page);
//👉 상세창 닫고 👉 목록 다시 불러오기 (삭제 반영)

}

const TABLE_HEADERS = [
{key:"orderDate", label:"지시일"},    
{key:"workOrderNo", label:"지시번호"}, 
{key:"itemCode", label:"품목코드"},
{key:"itemName", label:"품목명"},
{key:"planQty", label:"계획수량"},
{key:"startDate", label:"시작일"},
{key:"endDate", label:"종료일"},
{key:"status", label:"상태"},
]

/*
서버에 HTTP 요청을 보내는 부분이에요.
await 때문에 “서버 응답이 올 때까지” 잠깐 기다렸다가 다음 줄로 가요.
res는 응답(response) 객체예요. (상태코드, 헤더, body 등을 들고 있음)
method를 안 적으면 기본이 GET이라 “조회” 요청이 됩니다.
*/

/*
openDetail 이라는 함수를 만든 거고,
id: number 는 “상세 조회할 생산지시의 번호(정수)”를 받는다는 뜻이에요.
async 는 함수 안에서 await를 쓰기 위해 붙인 키워드예요. (비동기 처리)
*/


/*
useEffect를 쓰면?
- 화면 열자마자
- 자동으로 생산지시 목록 조회
- 사용자는 바로 목록을 볼 수 있음

왜 [] (빈 배열)을 쓰는가? **“처음 한 번만 실행해라”**라는 의미

dependency배열	실행 시점
없음	        렌더링 될 때마다
[page]	       page가 바뀔 때마다
[]	           처음 딱 한 번
*/
//엑셀 다운로드
const handleExcelDownload = () => {
    const excelData: (string | number) [][] = [
        ["#", ...TABLE_HEADERS.map(h => h.label)], ...rows.map((row, idx) => [
idx+1, row.orderDate, row.workOrderNo, row.itemCode, row.itemName, row.planQty,
row.startDate, row.endDate, row.status,
 ]),
];
const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "생산관리");

    const excelFile = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelFile], { type: "application/octet-stream" });
    saveAs(blob, "생산관리_리스트.xlsx");
};

//페이징 이동함수 추가
const goPage = (p:number) => {
    const next = Math.max(0, Math.min(p, totalPages - 1));
    //fetchOrders(next);
    setPage(next);
};



/*
생산지시 등록
*/




const handleSave = async () => {//저장 버튼 클릭 시 실행되는 함수

    // 1️⃣ workOrderNo 생성
  const newWorkOrderNo = `WO-${Date.now()}`; // 예: WO-1674156100000

await fetch(`${API_BASE}/api/production/orders`,{
//👉 서버에 생산지시 저장 요청 보내기
method:"POST", //👉 새 데이터 등록이라는 뜻
headers:{"Content-Type":"application/json"},//👉 “JSON 형식으로 데이터 보낼게요”라고 서버에 알려줌
body:JSON.stringify({
    ...form,
    workOrderNo: newWorkOrderNo,
    planQty:Number(form.planQty),}),    
//👉 입력한 form 데이터를 서버로 전송 ...form → 입력한 값 전부  planQty: Number(form.planQty) 👉 숫자로 변환
});
setShowCreate(false);
//fetchOrders();//저장 후 다시 목록 조회
fetchOrders(page);
}


    return(
<>
 <Wrapper>
      <Lnb />
      <DflexColumn>
        <Content>
          <Top />
        </Content>

        <Container fluid className="p-0">

          <Row>
            <Col>
              <Ctap>
            <SpaceBetween>
            <h4>생산관리</h4>
            <Dflex>
            <Button className="mx-2 my-3"  onClick={handleExcelDownload} variant="success">
            엑셀다운로드
            </Button>  
            <Button className="my-3" onClick={() => setShowCreate(true)}>
              생산지시 등록  
            </Button>
            </Dflex>

            </SpaceBetween>
<Table bordered hover>
<thead>
<tr className="text-center">
<th>#</th>
{TABLE_HEADERS.map((h) => (
    <th key={h.key}>
        {h.label}
    </th>
))}
</tr>
</thead>
<tbody>
{(rows || []).map((r, i) => (
<tr key={i} className="text-center">
<td>{i + 1 + page * size}</td>    
<td>{r.orderDate}</td>
<td>
  <span 
  style={{cursor:"pointer", color:"#0d6efd", textDecoration:"underline"}}
  onClick={() => openDetail(r.id)}
  >
  {r.workOrderNo}
  </span>
</td>
<td>{r.itemCode}</td>
<td>{r.itemName}</td>
<td>{r.planQty}</td>
<td>{r.startDate}</td>
<td>{r.endDate}</td>
<td>{r.status}</td>
</tr>  
))}
</tbody>
</Table>              

<Center>
    {totalPages > 0 && (
      <Pagination>
        <Pagination.First disabled={page === 0} onClick={() => goPage(0)}/>
        <Pagination.Prev disabled={page === 0} onClick={() => goPage(page - 1)}/>

{Array.from({length:totalPages}).map((_, i) => i).filter((i) => i >= page - 2 && i <= page + 2)
.map((i) => (
<Pagination.Item key={i} active={i === page} onClick={() => goPage(i)}>
{i + 1}
</Pagination.Item>
))}
<Pagination.Next
disabled={page >= totalPages - 1}
onClick={() => goPage(page + 1)}
/>
<Pagination.Last
disabled={page >=  totalPages - 1} onClick={() => goPage(totalPages - 1)}
/>
</Pagination> 
)}
<PageTotal>
총 {rows.length}건 {page + 1} / {totalPages} 페이지
</PageTotal>

</Center>
{/* 생산지시 등록 모달 */}
      <Modal show={showCreate} onHide={() => setShowCreate(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>생산지시 등록</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Control className="mb-2" type="date" name="orderDate" onChange={handleChange} />
            <Form.Control className="mb-2" name="itemCode" placeholder="품목코드" onChange={handleChange} />
            <Form.Control className="mb-2" name="itemName" placeholder="품목명" onChange={handleChange} />
            <Form.Control className="mb-2" type="number" name="planQty" placeholder="계획수량" onChange={handleChange} />
            <Form.Control className="mb-2" type="date" name="startDate" onChange={handleChange} />
            <Form.Control className="mb-2" type="date" name="endDate" onChange={handleChange} />
            <Form.Control
  className="mb-2"
  name="workOrderNo"
  placeholder="지시번호 (자동 생성 또는 입력)"
  onChange={handleChange}
/>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleSave}>저장</Button>
        </Modal.Footer>
      </Modal>
</Ctap>
              </Col>
              </Row>
              </Container>
              </DflexColumn>
              </Wrapper>


{/*생산지시 상세 수정 모달 */}
<Modal show={showDetail} onHide={() => setShowDetail(false)} centered>
  
  <Modal.Header closeButton>
      <Modal.Title>생산지시 상세</Modal.Title>
  </Modal.Header>

  <Modal.Body>
    <Form>
      <Form.Control className="mb-2" type="date" name="orderDate"
value={editForm.orderDate}
onChange={(e) => setEditForm(prev => ({...prev, orderDate: e.target.value}))}     
      />

      {/*지시번호는 보통 수정을 막음 */}
      <Form.Control className="mb-2" name="workOrderNo"
      value={editForm.workOrderNo}
      disabled
      />

<Form.Control className="mb-2" name="itemCode"
placeholder="품목코드" value={editForm.itemCode}
onChange={(e) => setEditForm(prev =>({...prev, itemCode:e.target.value}))}/>

<Form.Control className="mb-2" name="itemName"
placeholder="품목명" value={editForm.itemName}
onChange={(e) => setEditForm(prev =>({...prev, itemName:e.target.value}))}/>

<Form.Control className="mb-2" name="planQty"
placeholder="계획수량" value={editForm.planQty}
onChange={(e) => setEditForm(prev =>({...prev, planQty:e.target.value}))}/>

<Form.Control className="mb-2" name="startDate"
value={editForm.startDate} type="date"
onChange={(e) => setEditForm(prev =>({...prev, startDate:e.target.value}))}/>

<Form.Control className="mb-2" name="endDate" 
value={editForm.endDate} type="date"
onChange={(e) => setEditForm(prev =>({...prev, endDate:e.target.value}))}/>

<Form.Control className="mb-2" name="status" 
placeholder="상태(대기/진행/완료)" value={editForm.status}
onChange={(e) => setEditForm(prev =>({...prev, status:e.target.value}))}/>{/*여기 네임값 안씀 */}
    </Form>
  </Modal.Body>

<Modal.Footer>
<Button variant="danger" onClick={handleDelete}>삭제</Button>
<Button variant="success" onClick={handleUpdate}>수정</Button>
</Modal.Footer>

</Modal>
</>
    )
}

export default ProductionManagement;