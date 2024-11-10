import styled from '@emotion/styled'
import colors from '@/constants/color'
import { fontSize, fontWeight } from '@/constants/font'
import { Trash2 } from 'lucide-react'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { formatDate } from '@/utils/formatDate'
import { useAuthStore } from '@/stores/authStore'
import useModalStore from '@/stores/modalStore'
import Modal from '@components/Modal'
import { ShowToast } from '@components/Toast'

interface Comment {
	commentId: number
	content: string
	createdAt: Date
	userId: number | null
	userName: string | null
	guestName: string | null
	type: 'MEMBER' | 'GUEST'
}

const CommentList = () => {
	const { postId } = useParams<{ postId: string }>()
	const { sessionId } = useAuthStore()
	const [commentsData, setCommentsData] = useState<Comment[]>([])
	const [error, setError] = useState<string | null>(null)
	const { openModal } = useModalStore()

	useEffect(() => {
		const fetchComments = async () => {
			try {
				const res = await axios.get(
					`http://nubble-backend-eb-1-env.eba-f5sb82hp.ap-northeast-2.elasticbeanstalk.com/posts/${postId}/comments`,
				)
				setCommentsData(res.data.comments)
			} catch (err) {
				setError('댓글을 불러오는 중 오류가 발생했습니다.')
			}
		}

		fetchComments()
	}, [postId])

	// 댓글 삭제 함수
	const handleDelete = async (commentId: number, type: 'MEMBER' | 'GUEST', password?: string) => {
		try {
			if (type === 'MEMBER') {
				// 멤버는 default 타입 모달 띄우기
				openModal({
					type: 'default',
					title: '댓글 삭제 확인',
					onAction: async () => {
						try {
							// 실제 삭제 요청
							await axios.delete(
								`http://nubble-backend-eb-1-env.eba-f5sb82hp.ap-northeast-2.elasticbeanstalk.com/comments/member/${commentId}`,
								{
									headers: { 'SESSION-ID': sessionId },
								},
							)
							ShowToast('댓글이 삭제되었습니다.', 'success')
							// 삭제 후 상태 업데이트
							setCommentsData((prevComments) =>
								prevComments.filter((comment) => comment.commentId !== commentId),
							)
						} catch (error) {
							console.error('댓글 삭제 중 에러 발생:', error)
							ShowToast('댓글 삭제 중 오류가 발생했습니다.', 'failed')
						}
					},
				})
			} else {
				// 게스트는 password 타입 모달 띄우기
				if (!password) {
					openModal({
						type: 'password',
						title: '댓글 삭제 확인',
						onAction: async (inputPassword) => {
							try {
								await axios.delete(
									`http://nubble-backend-eb-1-env.eba-f5sb82hp.ap-northeast-2.elasticbeanstalk.com/comments/guest/${commentId}`,
									{
										headers: { 'Content-Type': 'application/json' },
										data: { guestPassword: inputPassword },
									},
								)
								// 삭제 후 상태 업데이트는 여기에서 실행
								setCommentsData((prevComments) =>
									prevComments.filter((comment) => comment.commentId !== commentId),
								)
								ShowToast('댓글이 삭제되었습니다.', 'success')
							} catch (error) {
								ShowToast('비밀번호가 틀렸습니다.', 'failed')
							}
						},
					})
					return
				}

				// 비밀번호가 제공된 경우 삭제 진행
				await axios.delete(
					`http://nubble-backend-eb-1-env.eba-f5sb82hp.ap-northeast-2.elasticbeanstalk.com/comments/guest/${commentId}`,
					{
						headers: { 'Content-Type': 'application/json' },
						data: { guestPassword: password },
					},
				)
				// 삭제 후 상태 업데이트
				setCommentsData((prevComments) =>
					prevComments.filter((comment) => comment.commentId !== commentId),
				)
			}
		} catch (error) {
			console.error('댓글 삭제 중 에러 발생:', error)
		}
	}
	if (error) return <p>{error}</p>
	if (!commentsData.length) return <p>댓글이 없습니다.</p>

	return (
		<List>
			{commentsData.map((comment) => (
				<CommentItem
					key={comment.commentId}
					comment={comment}
					onDelete={() => handleDelete(comment.commentId, comment.type)}
				/>
			))}
		</List>
	)
}

const CommentItem = ({ comment, onDelete }: { comment: Comment; onDelete: () => void }) => {
	const displayName = comment.type === 'MEMBER' ? comment.userName : comment.guestName
	const { userName: loggedInUserName } = useAuthStore()

	const canDelete = comment.type === 'GUEST' || comment.userName === loggedInUserName

	return (
		<Item>
			<Header>
				<Nickname>{displayName}</Nickname>
				<Date>{formatDate(comment.createdAt)}</Date>
			</Header>
			<Content>{comment.content}</Content>
			<ActionButtons>
				{canDelete && (
					<DeleteButton onClick={onDelete}>
						<Trash2 size={14} />
						<span>삭제</span>
					</DeleteButton>
				)}
			</ActionButtons>
			<Modal />
		</Item>
	)
}

export default CommentList

// 스타일 정의
const List = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
`

const Item = styled.div`
	padding: 15px;
	background-color: ${colors.bgBlack};
	border-radius: 5px;
	border: 1px solid ${colors.bgBlack};
	color: white;
	border-bottom: 1px solid ${colors.commentBlack};
`

const Header = styled.div`
	display: flex;
	margin-bottom: 10px;
	gap: 10px;
	align-items: center;
`

const Nickname = styled.span`
	font-weight: bold;
	font-size: ${fontSize.md};
	color: ${colors.white};
	font-weight: ${fontWeight.bold};
`

const Date = styled.span`
	color: ${colors.deleteGray};
	font-size: ${fontSize.xs};
`

const Content = styled.p`
	margin: 0 0 10px 0;
	font-size: ${fontSize.md};
	color: ${colors.white};
	font-weight: ${fontWeight.regular};
`

const ActionButtons = styled.div`
	display: flex;
	justify-content: flex-end;
`

const DeleteButton = styled.button`
	display: flex;
	align-items: center;
	font-size: 14px;
	gap: 5px;
	background: none;
	border: none;
	color: ${colors.deleteGray};
	cursor: pointer;
	&:hover {
		color: ${colors.white};
	}
	svg {
		color: inherit;
	}
`
