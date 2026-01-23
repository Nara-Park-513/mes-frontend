import { useState, useEffect } from "react";
import Lnb from "../include/Lnb";
import Top from "../include/Top";
import { Wrapper, DflexColumn, DflexColumn2, Content, Ctap } from "../styled/Sales.styles";
import { Container, Row, Col, Tab, Tabs, Table, Button, Modal, Form, Pagination } 
from "react-bootstrap";
import { Group, Left, Right, Text6, Dflex, DflexEnd, Center, PageTotal } from "../styled/Component.styles";
import { Time, Select, Search } from "../styled/Input.styles";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// ✅ 타입 선언은 "객체"가 아니라 "type" 또는 "interface"로!
type TableRow = string[];

type TableData = {
  headers: string[];
  rows: TableRow[];
};

//백앤드 엔티티 dto형태
type SalesOrderPayload = {
    orderDate:string;
    customerCode:string;
    customerName:string;
    itemCode:string;
    itemName:string;
    orderQty:number;
    price:number;
    deliveryDate:string | null;
    remark:string;
}

type PageResponse<T> = {
  content: T[]; totalElements:number; totalPages:number;
  number:number; size:number;
}

const API_BASE = "http://localhost:9500";

const TABLE_HEADERS = [
"수주일자","거래처코드","거래처명","품목코드","품목명","규격","수주 잔량",
"단가","금액","납품 예정일","납품 여부","비고","상세보기",
]


const SalesManagement = () => {
//페이징 관련 추가
const [page, setPage] = useState(0);
const [size, setSize] = useState(10);
const [totalPages, setTotalPages] = useState(0);
const [totalElements, setTotalElements] = useState(0);
//페이징 관련 끝

 const[showCreate, setShowCreate] = useState(false);
 //add
 const[saving, setSaving] = useState(false);
 const[errorMsg, setErrorMsg] = useState<string>("");
 //add end
const [rows, setRows] =useState<TableRow[]>([]);
const [form, setForm] = useState({
    orderDate: "",
    customerCode: "",
    customerName: "",
    itemCode: "",
    itemName: "",
    orderQty: "",
    price: "",
    deliveryDate: "",
    remark: "",
    spec:"",
    remainQty:"",
    deliveryStatus:"미납",
  });

    const handleChange = (e: React.ChangeEvent<any>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

//목록 조회 (페이징)
const fetchOrders = async (pageArg = page, sizeArg = size) => {
  /*
  async : 서버 통신(fetch)은 시간이 걸리니까 "기다렸다가 결과를 받는 함수"라는 뜻
  pageArg = page : 함수 호출할 때 pageArg를 안주면 현재 state의 page 값을 사용
  sizeArg = size : 마찬가지로 안 주면 현재 state의 size 사용

  */
  const token = localStorage.getItem("token");
  /*
  
  */
  const params = new URLSearchParams();
  //
  if ((form as any).from) params.append("from",(form as any).from);
  if ((form as any).to) params.append("from",(form as any).to);
  params.append("page", String(pageArg));
  params.append("size", String(sizeArg));
  //
  //실제 서버 호출
  const res = await fetch(`${API_BASE}/api/sales/orders?${params.toString()}`,{
    method:"GET", credentials:"include", headers:{
      "Content-Type":"application/json",
      ...(token ? {Authorization: `Bearer ${token}`}:{}),
    },
    /* 
    params.toString() 앞에 주소가 쿼리스트링으로 변환되어 붙음
    await fetch() 서버 응답이 올때까지 기다림
    credentials:"include"
    쿠기 기반 로그인도 같이 쓰는 경우, 쿠키를 요청에 포함시키는 옵션
    (토큰 방식만 쓴다면 꼭 필요하진 않은데, 있어도 큰 문제는 없음)
    "Content-Type":"application/json"
    (GET이라 몸통이 없어서 사실상 크게 의미는 없지만 관례로 넣기도 함)
    ...(token ? {Authorization: `Bearer ${token}`}:{})
    토큰이 있으면 Authorization 헤더 추가
    토큰이 없으면 아무것도 추가 안 함
    조건부로 헤더를 붙인다는 문법
    */
  });
  const raw = await res.text();
  //why json res.json()은 한 번만 읽을 수 있는데,
  //에러가 났을 때도 내용을 보고 싶을 수 있음
  //text로 읽고 -> 성공이면 JSON.parse 하는 방식
  if (!res.ok) throw new Error(raw || `목록조회 실패 ((HTTP) ${res.status})`);//에러면 예외 던지기
  //성공이면 JSON으로 변환해 PageResponse로 만들기
  const data: PageResponse<any> = raw ? JSON.parse(raw) : {content:[], totalElements:0, totalPages:0, number:pageArg, size:sizeArg}
/*
raw가 있으면 JSON.parse(raw)로 객체로 변환
raw가 비어있으면(서버가 빈 응답을 준 경우) 안전하게 기본값을 넣음
PageResponse는 보통 이런 구조일 거야:
content: 실제 데이터 목록
totalElements: 전체 데이터 개수
totalPages: 전체 페이지 수
number: 현재 페이지 번호
size: 한 페이지 크기
*/
const mapped: TableRow[] = data.content.map((o) => {
  const qty = Number(o.orderQty ?? 0);
  const price = Number(o.price ?? 0);
  const amount = Number(o.amount ?? qty * price);

  return[
    o.orderDate ?? "",
    o.customerCode ?? "",
    o.customerName ?? "",
    o.itemCode ?? "",
    o.itemName ?? "",
    "-",
    String(qty),
    String(price),
    String(amount),
    o.deliveryDate ?? "",
    "미납",
    o.remark ?? "-",
    "보기",
  ];
});

setRows(mapped);
setPage(data.number);
setSize(data.size);
setTotalPages(data.totalPages);
setTotalElements(data.totalElements);
}
  
//최초 로딩시 서버 데이터 불러오기

useEffect(() => {
  fetchOrders().catch((e) => console.error(e));
},[]);

//모달 열때 에러 초기화
const openCreate = () => {
    setErrorMsg("");
    setShowCreate(true);
}

// const [rows, setRows] =useState<TableRow[]>(tableData.rows) 하드코딩

  const handleExcelDownload = () => {
    // ✅ 엑셀은 "헤더 + 모든 rows"를 넣는 방식이 정석
    const excelData: (string | number)[][] = [
      //["#", ...tableData.headers] 최초 가짜 데이터 테스트 시,
      ["#", ...TABLE_HEADERS],
      ...rows.map((row, idx) => [idx + 1, ...row]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "수주관리");

    const excelFile = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelFile], { 
      //Binary Large Object 대용량 비정형 이진 데이터 덩어리
      type: "application/octet-stream",
    });

    saveAs(blob, "수주관리_리스트.xlsx");
  };

 // ✅ 백엔드로 저장 + POST 성공 시 GET으로 재조회
  const handleCreateSave = async () => {
    setErrorMsg("");

    // 1) 기본 유효성 체크(최소)
    if (!form.orderDate || !form.customerCode || !form.customerName || !form.itemCode || !form.itemName) {
      setErrorMsg("필수 항목(수주일자/거래처/품목)을 입력하세요.");
      return;
    }

    const qty = Number(form.orderQty || 0);
    const price = Number(form.price || 0);

    if (!qty || qty <= 0) {
      setErrorMsg("수주 수량(orderQty)은 1 이상이어야 합니다.");
      return;
    }
    if (!price || price <= 0) {
      setErrorMsg("단가(price)은 1 이상이어야 합니다.");
      return;
    }

    // 2) 백엔드로 보낼 payload (엔티티 필드만)
    const payload: SalesOrderPayload = {
      orderDate: form.orderDate,
      customerCode: form.customerCode,
      customerName: form.customerName,
      itemCode: form.itemCode,
      itemName: form.itemName,
      orderQty: qty,
      price: price,
      deliveryDate: form.deliveryDate ? form.deliveryDate:null, // 백엔드가 null 허용이면 "" 대신 null로 바꿔도 됨
      remark: form.remark || "",
    };

    /*3) 화면 전용 계산/필드
    const amount = qty * price;
    const spec = form.spec || "-";
    const remainQty = form.remainQty ? String(Number(form.remainQty)) : String(qty); // 기본은 수주수량으로
    const deliveryStatus = form.deliveryStatus || "미납";*/

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      // ✅ 실제 백엔드 POST
      const res = await fetch(`${API_BASE}/api/sales/orders`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        ...(token ? {Authorization:`Bearer ${token}`}:{}),
        },
        //credentials:"include", //add
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `저장 실패 (HTTP ${res.status})`);
      }

      //저장 성공 -> 서버에서 다시 조회(새로고침해도 유지)
      await fetchOrders();

      //폼초기화
      setForm({
      orderDate: "", customerCode: "", customerName: "", itemCode: "", itemName: "", orderQty: "", price: "",
      deliveryDate: "", remark: "", spec: "", remainQty: "", deliveryStatus: "미납",
      });

      setShowCreate(false);
    } catch (err: any) {
      setErrorMsg(err?.message || "저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };
      // 백엔드 응답(SalesOrderResponse)을 받아도 되고(여기선 사용 안함)
      // const saved = await res.json();

      /* ✅ 성공하면 화면 rows에 추가(13개 컬럼 맞춤)
      const newRow: TableRow = [
        payload.orderDate,
        payload.customerCode,
        payload.customerName,
        payload.itemCode,
        payload.itemName,
        spec,
        remainQty,
        String(price),
        String(amount),
        payload.deliveryDate || "-",
        deliveryStatus,
        payload.remark || "-",
        "보기",
      ];

      setRows((prev) => [newRow, ...prev]);

      // 4) 폼 초기화 + 모달 닫기
      setForm({
        orderDate: "",
        customerCode: "",
        customerName: "",
        itemCode: "",
        itemName: "",
        orderQty: "",
        price: "",
        deliveryDate: "",
        remark: "",
        spec: "",
        remainQty: "",
        deliveryStatus: "미납",
      });

      
  };*/

  const goPage = (p: number) => {
   const next = Math.max(0, Math.min(p, totalPages - 1));
   fetchOrders(next, size);
    }

  return (
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
                <h5>영업관리</h5>

                <DflexColumn2 className="mt-4 mb-3">
                  <Left>
                    <Dflex>
                      <Group>
                        <Text6>수주일자조회기간</Text6>
                        <Dflex>
                          {/* 기간 조회는 보통 date가 자연스러움 */}
                          <Time type="date" name="from" onChange={handleChange} />
                          <span className="mx-2">-</span>
                          <Time type="date" name="to" onChange={handleChange} />
                        </Dflex>
                      </Group>

                      <Group className="mx-3">
                        <Text6>거래처</Text6>
                        <Search type="search" name="customer" onChange={handleChange} />
                      </Group>

                      <Group>
                        <Text6>품목</Text6>
                        <Search type="search" name="item" onChange={handleChange} />
                      </Group>

                      <Group className="mx-2">
                        <Text6>납품여부</Text6>
                        <Select name="deliveryYn" onChange={handleChange}>
                          <option value="ALL">전체</option>
                          <option value="N">미납</option>
                          <option value="Y">납품완료</option>
                        </Select>
                      </Group>
                    </Dflex>
                  </Left>

                  <Right>
                    <Group>
                      <DflexEnd>
                        <Button variant="success" onClick={handleExcelDownload}>
                          엑셀 다운
                        </Button>
                        <Button variant="primary" className="mx-3">
                          일괄 납품
                        </Button>
<Button variant="secondary" onClick={openCreate}>수주 등록</Button>
                      </DflexEnd>
                    </Group>
                  </Right>
                </DflexColumn2>

                <Tabs defaultActiveKey="orders" className="mb-3" fill>
                  <Tab eventKey="orders" title="수주관리">
                    <Table responsive>
                      <thead>
                        <tr>
                          <th className="bg-secondary text-white">#</th>
                          {TABLE_HEADERS.map((title, index) => (
                            <th key={index} className="bg-secondary text-white">
                              {title}
                            </th>
                          ))}
                        </tr>
                      </thead>

                      <tbody>
                        {rows.map((row, rIdx) => (
                          <tr key={rIdx}>
                            <td>{rIdx + 1 + page * size}</td>
                            {row.map((cell, cIdx) => (
                              <td key={cIdx}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>

                      <tfoot>
                        <tr>
                          <th className="bg-secondary text-white text-center" colSpan={6}>
                            합계
                          </th>
                          <th className="bg-secondary text-warning fw-bold">200</th>
                          <th className="bg-secondary text-warning fw-bold">200</th>
                          <th className="bg-secondary text-white">&nbsp;</th>
                          <th className="bg-secondary text-white"></th>
                          <th className="bg-secondary text-warning fw-bold">200</th>
                          <th className="bg-secondary text-white" colSpan={5}></th>
                        </tr>
                      </tfoot>
                    </Table>
                    <Center>
                    {totalPages > 1 && (
                      <>
                      
                        <PageTotal>
                          총 {totalElements}건 {page + 1} / {totalPages} 페이지
                        </PageTotal>

                      <Pagination className="mb-0">
                      <Pagination.First disabled={page === 0} onClick={() => goPage(0)}/>
                        <Pagination.Prev disabled={page === 0} onClick={() => goPage(page - 1)}/>
                        {Array.from({length:totalPages}).map((_, i) => i).filter((i) => i >= page -2 && i <= page + 2).map((i) => (
                        <Pagination.Item key={i} active={i === page} onClick={() => goPage(i)}>{i + 1}</Pagination.Item>
                        ))}
                        <Pagination.Next 
                        disabled={page >= totalPages -1} onClick={() => fetchOrders(page + 1)}/>
                      <Pagination.Last 
                      disabled={page >= totalPages -1} onClick={() => fetchOrders(totalPages - 1)}/>
                      </Pagination>
                      </>
                    )}
                    </Center>
                  </Tab>

                  <Tab eventKey="delivery" title="납품관리"></Tab>
                  <Tab eventKey="search" title="수주내역조회"></Tab>
                  <Tab eventKey="dsearch" title="납품내역조회"></Tab>
                </Tabs>
              </Ctap>
            </Col>
          </Row>
        </Container>
      </DflexColumn>
    </Wrapper>

{/*모달 */}    
<Modal show={showCreate} onHide={()=> setShowCreate(false)} centered backdrop="static">

<Modal.Header closeButton>
    <Modal.Title>
    수주 등록
    </Modal.Title>    
</Modal.Header>

<Modal.Body>
    <Form>
        <Form.Group className="mb-2">
                <Form.Label>수주일자</Form.Label>
                <Form.Control type="date" name="orderDate" value={form.orderDate} onChange={handleChange}/>
        </Form.Group>

        <Form.Group className="mb-2">
                <Form.Label>거래처코드</Form.Label>
                <Form.Control name="customerCode" value={form.customerCode} onChange={handleChange}/>
        </Form.Group>

        <Form.Group className="mb-2">
                <Form.Label>거래처명</Form.Label>
                <Form.Control name="customerName" value={form.customerName} onChange={handleChange}/>
        </Form.Group>

        <Form.Group className="mb-2">
                <Form.Label>품목코드</Form.Label>
                <Form.Control name="itemCode" value={form.itemCode} onChange={handleChange}/>
        </Form.Group>

        <Form.Group className="mb-2">
                <Form.Label>품목명</Form.Label>
                <Form.Control name="itemName" value={form.itemName} onChange={handleChange}/>
        </Form.Group>

        <Form.Group className="mb-2">
                <Form.Label>수주 수량</Form.Label>
                <Form.Control type="number" name="orderQty" value={form.orderQty} onChange={handleChange}/>
        </Form.Group>

        <Form.Group className="mb-2">
                <Form.Label>단가</Form.Label>
                <Form.Control type="number" name="price" value={form.price} onChange={handleChange}/>
        </Form.Group>

        <Form.Group className="mb-2">
                <Form.Label>납품예정일</Form.Label>
                <Form.Control type="date" name="deliveryDate" value={form.deliveryDate} onChange={handleChange}/>
        </Form.Group>

        <Form.Group className="mb-2">
                <Form.Label>비고</Form.Label>
                <Form.Control  name="remark" value={form.remark} onChange={handleChange}/>
        </Form.Group>
    </Form>

</Modal.Body>

<Modal.Footer>
    <Button variant="secondary" onClick={() => setShowCreate(false)} disabled={saving}>
        닫기
    </Button>
    <Button variant="secondary" onClick={handleCreateSave} disabled={saving}>
        {saving ? "저장중..." : "저장"}
    </Button>
</Modal.Footer>


</Modal>
</>
  );
};



export default SalesManagement;