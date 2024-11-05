import { create } from 'zustand'
import axios from 'axios'

interface LikeStore {
	liked: boolean
	likeCount: number
	toggleLike: (postId: string, sessionId: string) => Promise<void>
	setLikeData: (liked: boolean, likeCount: number) => void // 초기 데이터를 설정하는 함수
}

export const useLikeStore = create<LikeStore>((set) => ({
	liked: false,
	likeCount: 0,

	setLikeData: (liked, likeCount) => set({ liked, likeCount }),

	toggleLike: async (postId, sessionId) => {
		if (!sessionId) {
			alert('로그인이 필요합니다.')
			return
		}

		const currentLiked = useLikeStore.getState().liked
		const currentLikeCount = useLikeStore.getState().likeCount

		// 낙관적 업데이트
		set({
			liked: !currentLiked,
			likeCount: currentLiked ? currentLikeCount - 1 : currentLikeCount + 1,
		})

		try {
			if (!useLikeStore.getState().liked) {
				await axios.delete(`${import.meta.env.VITE_NUBBLE_SERVER}/posts/${postId}/likes`, {
					headers: {
						'SESSION-ID': sessionId,
					},
				})
			} else {
				await axios.put(
					`${import.meta.env.VITE_NUBBLE_SERVER}/posts/${postId}/likes`,
					{},
					{
						headers: {
							'SESSION-ID': sessionId,
						},
					},
				)
			}
		} catch (err) {
			console.error('좋아요 요청 실패:', err)
			// 요청 실패 시 원래 상태로 롤백
			set({ liked: currentLiked, likeCount: currentLikeCount })
		}
	},
}))
