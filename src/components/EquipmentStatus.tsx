// 1. 데이터의 형식을 정의합니다.
interface StatusProps {
  data: any[]; // 부모에게서 넘어올 데이터 배열
}

// 2. 인자값(props) 자리에 { data }를 추가합니다.
const EquipmentStatus = ({ data }: StatusProps) => {
  return (
    <>
      {/* 이제 여기에 데이터를 활용한 UI를 그리시면 됩니다! */}
      {/* 예: data.length > 0 ? data[0].name : "데이터 없음" */}
    </>
  );
};

export default EquipmentStatus;