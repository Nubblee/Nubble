import styled from '@emotion/styled'
import colors from '@/constants/color'
import { fontSize, fontWeight } from '@/constants/font'
import { Trash2 } from 'lucide-react'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { formatDate } from '@/utils/formatDate'
import { useAuthStore } from '@/stores/authStore'

// 댓글 데이터의 타입을 정의
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
	const { sessionId } = useAuthStore() // 세션 ID를 가져옴
	const [commentsData, setCommentsData] = useState<Comment[]>([])
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		const fetchComments = async () => {
			try {
				const res = await axios.get(
					`http://nubble-backend-eb-1-env.eba-f5sb82hp.ap-northeast-2.elasticbeanstalk.com/posts/${postId}/comments`,
				)
				setCommentsData(res.data.comments) // 서버에서 받은 댓글 데이터를 상태에 저장
				console.log(res.data)
			} catch (err) {
				setError('댓글을 불러오는 중 오류가 발생했습니다.')
				console.error(err)
			}
		}

		fetchComments()
	}, [postId])

	// 댓글 삭제 함수
	const handleDelete = async (commentId: number) => {
		try {
			// 서버에 삭제 요청
			await axios.delete(
				`http://nubble-backend-eb-1-env.eba-f5sb82hp.ap-northeast-2.elasticbeanstalk.com/comments/member/${commentId}`,
				{
					headers: {
						'SESSION-ID': sessionId,
					},
				},
			)

			// 댓글 삭제 후 상태 업데이트
			setCommentsData((prevComments) =>
				prevComments.filter((comment) => comment.commentId !== commentId),
			)
			console.log(`댓글 ID ${commentId} 삭제 성공`)
		} catch (error) {
			console.error('댓글 삭제 중 에러 발생:', error)
		}
	}

	if (error) {
		return <p>{error}</p>
	}

	if (!commentsData.length) {
		return <p>댓글이 없습니다.</p>
	}

	return (
		<List>
			{commentsData.map((comment) => (
				<CommentItem key={comment.commentId} comment={comment} onDelete={handleDelete} />
			))}
		</List>
	)
}

const CommentItem = ({
	comment,
	onDelete,
}: {
	comment: Comment
	onDelete: (commentId: number) => void
}) => {
	const displayName = comment.type === 'MEMBER' ? comment.userName : comment.guestName
	const { userName: loggedInUserName } = useAuthStore()

	//삭제 버튼이 보이는 조건: 비로그인 댓글 or 로그인한 본인의 댓글  (나중에 userName 말고  userId 쓰는게 좋아보임)
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
					<DeleteButton onClick={() => onDelete(comment.commentId)}>
						<Trash2 size={14} />
						<span>삭제</span>
					</DeleteButton>
				)}
			</ActionButtons>
		</Item>
	)
}

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
		color: inherit; /* 부모의 컬러를 따르도록 설정 */
	}
`

export default CommentList
