import React, {useEffect, useState} from 'react';
//리액트 hook를 사용하여 컴포넌트 상태 관리와 생명주기를 제어 합니다
//wjdakf java와 비슷

//api함수들
import { getProductionStatus, getWorkOrders, getEquipmentStatus, getInventoryStatus} from '../api.tsx';
import ProductionStatus from './ProductionStatus';
import WorkOrderStatus from './WorkOrderStatus';
import EquipmentStatus from './EquipmentStatus';
import InventoryStatus from './InventoryStatus';

interface ProductionData{
    id:number;
    name:string;
    status:string;
}
interface WorkOrderData{}
interface EquipmentData{}
interface InventoryData{}

const DashBoard: React.FC = () => {//함수형 컴포넌트 Function Component
//각 데이터 카테고리에 대해 별도의 상태(state)를 선언
//초기값은 빈 배열
const[production, setProduction] = useState<ProductionData[]>([]);
const[workOrders, setWorkOrders] = useState<WorkOrderData[]>([]);
const[equipment, setEquipment] = useState<EquipmentData[]>([]);
const[inventory, setInventory] = useState<InventoryData[]>([]);

//컴포넌트가 처음 렌더링 할때 한번만 실행(의존성 배열 때문에)
useEffect(() => { 
    fetchData();
}, []);

const fetchData = async () => {
    try{//Promise.all 4개의 api를 병렬로 호출 -> 모든 요청이 끝날때 까지 기다림(네트워크 효율성 향상!)
        const[prodRes, workRes, equipRes, invRes] = await Promise.all([
            getProductionStatus(),
            getWorkOrders(),
            getEquipmentStatus(),
            getInventoryStatus()
        ]);
        setProduction(prodRes.data);
        setWorkOrders(workRes.data);
        setEquipment(equipRes.data);
        setInventory(invRes.data);
    } catch(error){//에러가 생길 경우
console.error('에러가 발생함: ', error);
    }
}
    return(
        <>
        <h1>Smart MES Dashboard</h1>
        <div className="">
<ProductionStatus data={production}/>
<WorkOrderStatus data={workOrders}/>
<EquipmentStatus data={equipment}/>
<InventoryStatus data={inventory}/>
        </div>
        </>
    )
}

export default DashBoard;