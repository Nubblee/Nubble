import colors from '@/constants/color'
import { fontSize } from '@/constants/font'
import { useAuthStore } from '@/stores/authStore'
import { formatDate } from '@/utils/formatDate'
import CommentForm from '@components/comment/CommentForm'
import CommentList from '@components/comment/CommentList'
import FloatingMenu from '@components/FloatingMenu'
import RenderMarkdown from '@components/RenderMarkdown'
import Toast from '@components/Toast'
import styled from '@emotion/styled'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

interface PostData {
	postId: number
	createdAt: Date
	title: string
	content: string
	thumbnailUrl: string
	postStatus: 'PUBLISHED' | 'DRAFT'
	userId: number
	userNickname: string
}

const PostDetail = () => {
	const { title, postId } = useParams<{ title: string; postId: string }>()
	const [postData, setPostData] = useState<PostData | null>(null)
	const [error, setError] = useState<string | null>(null)
	const [likeCount, setLikeCount] = useState(0)
	const [liked, setLiked] = useState(false)
	const { sessionId } = useAuthStore()
	const navigate = useNavigate()
	const { userName } = useAuthStore()

	const handlePostEdit = () => {
		navigate(`/write?id=${postId}`, { state: { postData } })
	}

	console.log(postData)

	useEffect(() => {
		const fetchPostData = async () => {
			try {
				const res = await axios.get(`${import.meta.env.VITE_NUBBLE_SERVER}/posts/${postId}`, {
					headers: {
						'SESSION-ID': sessionId,
					},
				})
				setPostData(res.data)
				setLikeCount(res.data.likeCount) // 초기 좋아요 수 설정
				setLiked(res.data.postLiked) // 초기 좋아요 상태 설정
				console.log(res.data)

				if (res.data.title !== title) {
					navigate('/error') // 에러 페이지 경로에 맞게 수정
				}
			} catch (err: unknown) {
				if (axios.isAxiosError(err)) {
					setError(err.response?.data?.message || '게시글을 가져오는 데 실패했습니다.')
				} else {
					setError('예상치 못한 에러가 발생했습니다.')
				}
				console.error(err)
			}
		}

		fetchPostData()
	}, [postId, sessionId])

	if (error) {
		return <p>{error}</p>
	}

	if (!postData) {
		return <p>로딩 중...</p>
	}

	return (
		<Container>
			<Toast />
			<FloatingMenu
				liked={liked}
				likeCount={likeCount}
				onLikeUpdate={(newLiked, newLikeCount) => {
					setLiked(newLiked)
					setLikeCount(newLikeCount)
				}}
			/>
			<Wrapper key={`${postData.title}-${postData.userNickname}`}>
				<TitleContainer>
					<div>
						<Title>{postData.title}</Title>
						<MetaData>
							<DateName>
								<span>{formatDate(postData.createdAt)}</span>
								<span>{postData.userNickname}</span>
							</DateName>
							{userName === postData.userNickname ? (
								<EditDelete>
									<button onClick={handlePostEdit}>수정</button>
									<button>삭제</button>
								</EditDelete>
							) : (
								''
							)}
						</MetaData>
					</div>
				</TitleContainer>
				<Content>
					<RenderMarkdown markdown={postData.content} />
				</Content>
				<CommentForm />
				<CommentList />
			</Wrapper>
		</Container>
	)
}

const Container = styled.div`
	display: flex;
	justify-content: center;
	max-width: 780px;
	margin: 20px auto;
	width: 100%;
`

const Wrapper = styled.div`
	display: flex;
	flex-direction: column;
	width: 100%;
`

const DateName = styled.div`
	display: flex;
	flex-direction: column;
	gap: 10px;
`

const TitleContainer = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 20px;
`

const Title = styled.h1`
	word-break: keep-all;
	overflow-wrap: break-word;
`

const MetaData = styled.div`
	display: flex;
	justify-content: space-between;
	width: 780px;
	gap: 10px;

	span:last-of-type {
		font-size: ${fontSize.xl};
	}
`

const EditDelete = styled.div`
	display: flex;
	gap: 5px;

	button {
		background: none;
		border: none;
		color: ${colors.commentGray};
		cursor: pointer;

		&:hover {
			text-decoration: underline;
		}
	}
`

const Content = styled.div`
	width: 100%;
	margin-bottom: 50px;
	border-bottom: 1px solid ${colors.commentBlack};
	padding-bottom: 30px;
	line-height: 1.8;

	pre {
		width: 100%;
		white-space: pre-wrap;
	}
`

export default PostDetail
