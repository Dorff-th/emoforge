import axiosAttach from "./axiosAttach";
import axiosPosts from "./axiosPosts";
import axiosDiary from "./axiosDiary";

/**
 * MemberAttachmentStatsResponse - 회원 첨부파일 통계
 */
export interface MemberAttachmentStatsResponse {
    editorImageCount : number;
    attachmentCount : number;
};

export const fetchMemberAttachmentStats = async () => {
    const response = await axiosAttach.get<MemberAttachmentStatsResponse>(
        `/me/statistics`
    );
    return response.data;
}

/**
 * MemberPostStatsResponse - 회원 게시글 통계
 */
// PostStatsResponse (Spring Boot) 와 동일
export interface MemberPostStatsResponse {
    postCount : number;
    commentCount : number;
}

export const fetchMemberPostStats = async () => {
    const response = await axiosPosts.get<MemberPostStatsResponse>(
        `/me/statistics`
    );
    return response.data;
}

/**
 * MemberDiaryStatsResponse - 회원 다이어리 통계
 */
export interface MemberDiaryStatsResponse {
    diaryEntryCount : number;
    gptSummaryCount : number;
    musicRecommendHistoryCount : number;
}

export const fetchMemberDiaryStats = async () => {
    const response = await axiosDiary.get<MemberDiaryStatsResponse>(
        `/me/statistics`
    );
    return response.data;
}