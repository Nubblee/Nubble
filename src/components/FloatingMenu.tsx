/** @jsxImportSource @emotion/react */
import colors from '@/constants/color'
import { useAuthStore } from '@/stores/authStore'
import { useLikeStore } from '@/stores/likeStore'
import styled from '@emotion/styled'
import { HeartIcon, Share2Icon } from 'lucide-react'
import { useParams } from 'react-router-dom'

const FloatingMenu = () => {
	const { liked, likeCount, toggleLike } = useLikeStore()

	const { sessionId } = useAuthStore()
	const { postId } = useParams<{ postId: string }>()

	const handleLikeClick = async () => {
		if (!postId) return
		toggleLike(postId, sessionId as string)
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
