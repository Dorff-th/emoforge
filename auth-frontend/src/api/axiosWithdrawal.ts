//회원 탈퇴 및 취소 요청 API
import axiosAuth from "./axiosAuth";

export const requestWithdrawal = async () => {  
    const response = await axiosAuth.post("/me/withdrawal");
    return response.data;
};  

export const cancelWithdrawal = async () => {  
    const response = await axiosAuth.post("/me/withdrawal/cancel");
    return response.data;
}