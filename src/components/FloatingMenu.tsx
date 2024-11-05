/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled'
import { useState } from 'react'
import { HeartIcon, Share2Icon } from 'lucide-react'
import colors from '@/constants/color'
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'
import { useParams } from 'react-router-dom'

interface IFloatingMenuProps {
	liked: boolean
	likeCount: number
	onLikeUpdate: (liked: boolean, likeCount: number) => void
}

const FloatingMenu = ({
	liked: initialLiked,
	likeCount: initialLikeCount,
	onLikeUpdate,
}: IFloatingMenuProps) => {
	const [liked, setLiked] = useState(initialLiked)
	const [likeCount, setLikeCount] = useState(initialLikeCount)
	const { sessionId } = useAuthStore()
	const { postId } = useParams<{ postId: string }>()

	const handleLikeClick = async () => {
		if (!postId) return

		try {
			if (liked) {
				await axios.delete(`${import.meta.env.VITE_NUBBLE_SERVER}/posts/${postId}/likes`, {
					headers: {
						'SESSION-ID': sessionId,
					},
				})
				setLiked(false)
				setLikeCount((prevCount) => prevCount - 1)
				onLikeUpdate(false, likeCount - 1)
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
				setLiked(true)
				setLikeCount((prevCount) => prevCount + 1)
				onLikeUpdate(true, likeCount + 1)
			}
		} catch (err) {
			if (axios.isAxiosError(err)) {
				console.error('좋아요 요청 실패 - 메시지:', err.message)
				console.error('좋아요 요청 실패 - 상태 코드:', err.response?.status)
				console.error('좋아요 요청 실패 - 응답 데이터:', err.response?.data)
			} else {
				console.error('예상치 못한 에러:', err)
			}
			alert('좋아요 요청 중 문제가 발생했습니다. 서버 관리자에게 문의하세요.')
		}
	}

	const handleCopyUrl = async () => {
		const currentUrl = window.location.href
		try {
			await navigator.clipboard.writeText(currentUrl)
			alert('클립보드에 링크가 복사되었어요.')
		} catch (err) {
			console.error('링크 복사 실패:', err)
		}
	}

	return (
		<MenuContainer>
			<IconContainer onClick={handleLikeClick}>
				<HeartIcon
					color={colors.primaryBlue}
					fill={liked ? colors.primaryBlue : 'none'}
					size={24}
				/>
				<LikeCount>{likeCount}</LikeCount>
			</IconContainer>
			<IconContainer onClick={handleCopyUrl}>
				<Share2Icon color={colors.primaryBlue} size={24} />
			</IconContainer>
		</MenuContainer>
	)
}

const MenuContainer = styled.div`
	position: fixed;
	left: 18%;
	top: 26%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-around;
	width: 54px;
	height: 137px;
	background-color: ${colors.commentBlack};
	border: 1px solid ${colors.primaryBlue};
	padding: 10px;
	border-radius: 30px;
	transition:
		left 0.3s ease,
		top 0.3s ease;

	@media (max-width: 1440px) {
		left: 12%;
		top: 26%;
	}

	@media (max-width: 1280px) {
		left: 9%;
	}

	@media (max-width: 1090px) {
		display: none;
	}
`

const IconContainer = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
	cursor: pointer;
	color: white;

	&:hover {
		transform: scale(1.1);
		transition: transform 0.2s;
	}
`

const LikeCount = styled.span`
	margin-top: 5px;
	font-size: 14px;
	color: ${colors.primaryBlue};
`

export default FloatingMenu
