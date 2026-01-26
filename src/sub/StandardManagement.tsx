
import {useEffect, useState} from "react";
import Lnb from "../include/Lnb";
import Top from "../include/Top";

import { Wrapper, DflexColumn, Content, Ctap } from "../styled/Sales.styles";
import { SpaceBetween, Center, Dflex, PageTotal } from "../styled/Component.styles";

import { Container, Row, Col, Table, Button, Modal, Form, Pagination } from "react-bootstrap";

import * as XLSX from "xlsx";
import {saveAs} from "file-saver";

const API_BASE = "http://localhost:9500";

type StandardItem = {
id:number;
stdCode: string;
stdName: string;        
stdGroup: string;           // 담당자
unit?: string;
useYn: "Y" | "N";          // 사용여부
remark?: string;            // 비고
updatedAt?: string;
}

//데이터 + 페이지 정보를 한 번에 받기 위해서
type PageResponse<T> = {
content:T[]; // 실제 데이터 목록 T는 뭐든 가능 (KPI, 주문, 회원 등) PageResponse<StandardItem> PageResponse<Order>
totalElements:number; // 전체 데이터 개수 “총 124건” 표시할 때 씀
totalPages:number; // 전체 페이지 수 페이지 버튼 몇 개 만들지 결정 << 1 2 3 4 >>
number:number; // 현재 페이지 번호 (0부터 시작)
size:number; // 한 페이지당 개수 몇 개씩 보여주는지 “10개씩 보기 / 20개씩 보기” 같은 옵션에 사용
}

//테이블 상단에 들어가는 헤더
//StandardItem에 들어있는 속성 중 하나를 key로 쓰고,화면에 보여줄 이름(label)을 같이 묶은 목록이다
//key: keyof StandardItem StandardItem 안에 실제로 존재하는 필드 이름만 key로 쓸 수 있다
const TABLE_HEADERS: {key:keyof StandardItem; label:string}[] = [
  { key: "stdCode", label: "기준코드" },
  { key: "stdName", label: "기준명" },
  { key: "stdGroup", label: "그룹" },
  { key: "unit", label: "단위" },
  { key: "useYn", label: "사용여부" },
  { key: "remark", label: "비고" },
];

const StandardManagement = () => {
    const [rows, setRows] = useState<StandardItem[]>([]);
    //ows 안에는 StandardItem 객체들이 여러 개 들어있는 배열만 들어갈 거야
    //([]) 이건 초기값 : 처음 화면이 뜰 때는 KPI 데이터가 아직 없으니까
    const [page, setPage] = useState(0);
    /*
    page: 현재 보고 있는 페이지 번호
    setPage: 페이지를 바꾸는 함수
    */
   const [size, setSize] = useState(10);//size: 한 페이지에 몇 개 보여줄지(페이지 크기) 10개씩 보기
   const [totalPages, setTotalPages] = useState(0);
/*
totalPages: 전체 페이지가 몇 개인지
페이지 버튼(1,2,3...)을 몇 개 만들지 결정할 때 필요
setTotalPages: 서버 응답으로 업데이트   
*/
const [totalElements, setTotalElements] = useState(0);
/*
totalElements: 전체 데이터가 총 몇 개인지 setTotalElements: 서버 응답으로 업데이트
*/
//등록 모달
const [showCreate, setShowCreate] = useState(false);
const [createForm, setCreateForm] = useState({
  stdCode: "",
  stdName: "",
  stdGroup: "",
  unit: "",
  useYn: "Y" as "Y" | "N",
  remark: "",
})

//상세 (수정/삭제) 모달
const [showDetail, setShowDetail] = useState(false); //상세보기 창(모달/패널)을 지금 보여줄까?”를 저장하는 상태
//true면 보여줌 false면 숨김
const [selected, setSelected] = useState<StandardItem | null>(null);
//사용자가 클릭한 “선택된 KPI 1건”을 저장하는 상태 
//<StandardItem | null> 선택된 KPI가 있을 때는 StandardItem 아직 아무것도 선택 안 했으면 null
//처음: null (선택 없음) 클릭 후: { id: 3, kpiName: "...", ... } (선택됨)
const [editForm, setEditForm] = useState({
  stdCode: "",
  stdName: "",
  stdGroup: "",
  unit: "",
  useYn: "Y" as "Y" | "N",
  remark: "",
})

const onCreateChange = (e:React.ChangeEvent<any>) => {//등록 폼 변경 함수
/*e 이벤트 객체(input에서 값이 바뀔 때 React가 주는 정보)
React.ChangeEvent<any>는 “change 이벤트다”라고 타입을 붙인 것
초보 단계에선 any 대신 HTMLInputElement 같은 걸 쓰기도 하지만, 
지금은 “일단 어떤 input이든 받겠다” 의미
*/
const {name, value} = e.target;
/*
name = input의 name 속성값 
*/
setCreateForm((prev) => ({...prev, [name]:value}));
/*
createForm 상태를 업데이트하는 코드
(prev)는 “업데이트 직전의 이전 상태값” { ...prev }는 이전 값들을 그대로 복사
[name]: value는 name에 해당하는 키만 value로 바꾼다
*/
}

//수정
const onEditChange = (e:React.ChangeEvent<any>) => {
    const {name, value} = e.target;
    setEditForm((prev) => ({...prev, [name]:value}));
}

//목록 조회 함수(페이징)
const fetchList = async (p:number) => {
/*
fetchList라는 함수를 만들었고 async → 함수 안에서 await를 쓸 수 있음(서버 통신 기다리기)
p: number → p는 숫자(페이지 번호). 예: 0, 1, 2…
*/
try{
const res = await fetch(`${API_BASE}/api/standards?page=${p}&size=${size}`);
//서버가 500/404 등 오류면 여기서 잡힘
if(!res.ok) throw new Error("서버 오류");
/*
응답 body를 JSON으로 변환해서 data에 넣음 data 구조는 PageResponse<StandardItem> 형태라고 타입 지정
즉 data 안에 content, totalPages, totalElements 등이 있어야 함
*/
const data:PageResponse<StandardItem> = await res.json();
setRows(data.content);
setTotalPages(data.totalPages);
setTotalElements(data.totalElements);
    }catch(err){
console.error("KPI 목록 조회 실패", err);
    }
};

useEffect(() => { //페이지가 바뀔때 자동 조회
    fetchList(page);
},[page]);

const goPage = (p:number) => {
/*
p를 안전한 범위로 강제로 맞춰주는 계산
✅목표 범위
최소값: 0 (맨 첫 페이지)
최대값: totalPages - 1 (맨 마지막 페이지)
왜 -1이냐면:
페이지가 totalPages개면 
마지막 페이지 번호는 0부터 시작해서 totalPages - 1이 마지막이기 때문.
예: totalPages=5면 페이지 번호는 0,1,2,3,4
*/
const next = Math.max(0, Math.min(p, totalPages - 1));
//결과적으로 next는 항상 0 ~ (totalPages-1) 사이의 값이 돼.
// Math.min(p, totalPages - 1) 너무 큰 숫자면, 맨 끝으로 보내버려 그건 안 되니까 10층까지만 갈게
// p = 100 totalPages=5 Math.min(100, 4)
//Math.max(0 너무 작은 숫자면, 맨 처음으로 보내버려 난 1하 3층 갈껀데 나가있어 1층이 최고 아래층
//얘는 페이지번호를 안전하게 울타리 안에 가두는 장치
/*
<button onClick={() => goPage(page - 1)}>이전</button>
<button onClick={() => goPage(page + 1)}>다음</button>

광클릭 page + 1 + 1 + 1
*/
setPage(next);
}

// ✅ 엑셀 다운로드
  const handleExcelDownload = () => {
    const excelData: (string | number)[][] = [
      ["#", ...TABLE_HEADERS.map((h) => h.label)],
      ...rows.map((r, idx) => [
        idx + 1 + page * size,
        r.stdCode,
        r.stdName,
        r.stdGroup ?? "",
        r.unit ?? "",
        r.useYn ?? "Y",
        r.remark ?? "",
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "기준정보관리");

    const excelFile = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelFile], { type: "application/octet-stream" });
    saveAs(blob, "기준정보관리_리스트.xlsx");
  };

  //등록저장
  const handleSave = async () => {

    const res = await fetch(`${API_BASE}/api/standards`, {
method: "POST",//새 데이터를 등록”하는 요청이니까 POST 사용.
headers: { "Content-Type": "application/json" },
//내가 보내는 body는 JSON 형식이야” 라고 서버에 알려주는 헤더.
      body: JSON.stringify({//실제로 서버에 보낼 데이터(객체)를 JSON 문자열로 변환해서 body에 넣음.
          stdCode: createForm.stdCode,
        stdName: createForm.stdName,
        stdGroup: createForm.stdGroup || null,
        unit: createForm.unit || null,
        useYn: createForm.useYn || "Y",
        remark: createForm.remark || "",
      }),
    });

    if (!res.ok) { //실패한다면
      const raw = await res.text().catch(() => "");
      //혹시 읽다가 에러 나면 ""로 처리(앱 터지는 거 방지).
      alert(raw || "등록 실패");
      return;//실패했으면 여기서 함수 종료
    }

    setShowCreate(false);//성공 처리: 모달 닫기 + 목록 다시 불러오기
    fetchList(page);//현재 페이지(page) 기준으로 목록을 다시 조회해서

    //폼 초기화 (다음등록을 위해)
    setCreateForm({
      stdCode: "",
      stdName: "",
      stdGroup: "",
      unit: "",
      useYn: "Y",
      remark: "",
    });


  }

  //상세 열기
  const openDetail = async(id:number) => {
    const res = await fetch(`${API_BASE}/api/standards/${id}`);
    if(!res.ok) throw new Error("상세 조회 실패");
    //실패(404, 500 등)면 Error를 던져서 함수 실행을 중단.
    const data:StandardItem = await res.json();
//서버가 내려준 JSON 응답을 자바스크립트 객체로 변환.
    setSelected(data);
    setEditForm({//수정 폼에 넣을 값들을 한꺼번에 세팅 시작.
      stdCode: data.stdCode || "",
      stdName: data.stdName || "",
      stdGroup: data.stdGroup || "",
      unit: data.unit || "",
      useYn: (data.useYn || "Y") as "Y" | "N",
      remark: data.remark || "",
    });
    setShowDetail(true); //상세/수정 모달을 화면에 보여주도록 상태 변경.
  }

  //수정
  const handleUpdate = async () => {
    if(!selected) return;

const res = await fetch(`${API_BASE}/api/standards/${selected.id}`,{
method:"PUT", headers:{"Content-Type":"application/json"},
body:JSON.stringify({
...editForm,
}),
    });
if(!res.ok) {
const raw = await res.text().catch(() => "");
alert(raw || "수정 실패");
return; 

setShowDetail(false);
fetchList(page);
//성공처리 상세창을 닫고 목록을 새로고침
}

  }
  //삭제
const handleDelete = async () => {
    if(!selected) return; //삭제할 대상이 있는지 확인

    //진짜 삭제할 건지 한 번 더 확인
    const ok = window.confirm("정말 삭제 할까요");
    if (!ok) return;

    //서버에 삭제 요청 보내기
    const res = await fetch(`${API_BASE}/api/standards/${selected.id}`,{
        method:"DELETE",
    })

    if(!res.ok){//삭제 실패했을 때 처리
        const raw = await res.text().catch(() => "");
        alert(raw || "삭제 실패");
        return;
    }
    //삭제 성공했을 때
    setShowDetail(false);
    fetchList(page);
}


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
<h4>기준정보관리</h4>
<Dflex>
<Button className="mx-2 my-3" onClick={handleExcelDownload} variant="success">엑셀다운로드</Button> 
<Button className="my-3" onClick={() => setShowCreate(true)} variant="success">기준정보등록</Button>     
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
<td onClick={() => openDetail(r.id)}>
    {r.stdCode}
</td>  
<td>{r.stdName}</td>
<td>{r.stdGroup ?? ""}</td>
<td>{r.unit ?? ""}</td>
<td>{r.useYn}</td>
<td>{r.remark ?? ""}</td>     
        </tr>
    ))}
</tbody>
</Table>

<Center>
    {totalPages > 0 &&(
<Pagination>
<Pagination.First disabled={page === 0} onClick={() => goPage(0)}/>
<Pagination.Prev disabled={page === 0} onClick={() => goPage(page - 1)}/>
{Array.from({length:totalPages}).map((_, i) => i)
.filter((i) => i >= page - 2 && i <= page + 2)
.map((i) => (
<Pagination.Item key={i} active={i === page} onClick={() => goPage(i)}>
{i + 1}
</Pagination.Item>
))}
<Pagination.Next disabled={page >= totalPages-1} onClick={() => goPage(page + 1)}/>
<Pagination.Last disabled={page >= totalPages-1} onClick={() => goPage(totalPages -1)}/>
</Pagination>
    )}
    <PageTotal>
총{totalElements}건 {page  + 1} / {totalPages || 1} 페이지
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
<Modal.Title>
기준정보 등록
</Modal.Title>
    </Modal.Header>
    <Modal.Body>
          <Form>
            <Form.Control className="mb-2" name="stdCode" placeholder="기준코드" 
            value={createForm.stdCode} onChange={onCreateChange} />

            <Form.Control className="mb-2" name="stdName" placeholder="기준명" 
            value={createForm.stdName} onChange={onCreateChange} />

            <Form.Control className="mb-2" name="stdGroup" placeholder="그룹" 
            value={createForm.stdGroup} onChange={onCreateChange} />

            <Form.Control className="mb-2" name="unit" placeholder="단위" 
            value={createForm.stdGroup} onChange={onCreateChange} />

            <Form.Select className="mb-2" name="useYn" value={createForm.useYn} onChange={onCreateChange}>
              <option value="Y">사용</option>
              <option value="N">미사용</option>
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
          <Modal.Title>기준정보 상세</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Control className="mb-2" name="stdCode" placeholder="기준코드" 
            value={editForm.stdCode} onChange={onEditChange} />

            <Form.Control className="mb-2" name="stdName" placeholder="기준명" 
            value={editForm.stdName} onChange={onEditChange} />

            <Form.Control className="mb-2" name="stdGroup" placeholder="담당자" 
            value={editForm.stdGroup} onChange={onEditChange} />

            <Form.Control className="mb-2" name="unit" placeholder="단위" 
            value={editForm.unit} onChange={onEditChange} />

            <Form.Select className="mb-2" name="useYn" value={editForm.useYn} onChange={onEditChange}>
              <option value="Y">사용</option>
              <option value="N">미사용</option>
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

export default StandardManagement;
