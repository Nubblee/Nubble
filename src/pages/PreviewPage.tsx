import React, { useRef } from 'react'
import styled from '@emotion/styled'
import { ImagePlus } from 'lucide-react'
import colors from '@/constants/color'
import { fontSize, fontWeight } from '@/constants/font'
import Button from '@components/Button'
import useGoBack from '@/hooks/useGoBack'
import useWrite from '@/hooks/useWrite'
import useFileUpload from '@/hooks/useFileUpload'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'
import { ShowToast } from '@components/Toast'

const PreviewPage = () => {
	const {
		markdownTitle,
		markdownContent,
		thumbnail,
		boardId,
		description,
		setThumbnail,
		setDescription,
		reset,
	} = useWrite()
	const { userId } = useAuthStore()
	const { uploadFile } = useFileUpload()
	const fileRef = useRef<HTMLInputElement>(null)
	const navigate = useNavigate()
	const { sessionId } = useAuthStore()
	const location = useLocation()
	const { isEditing, post } = location.state || ''

	const handleBack = useGoBack()

	const handleThumnaileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (file) {
			const res = await uploadFile(file)
			setThumbnail(`![](${res.baseUrl + res.fileName})`)
		}
	}

	const handleThumnailReupload = () => {
		if (fileRef.current) {
			fileRef.current.click()
		}
	}

	const handleThumnailDelete = () => {
		setThumbnail('')
	}

	const onChangeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setDescription(e.target.value)
	}

	const handleSubmit = async () => {
		const method = isEditing ? 'put' : 'post'
		const url = isEditing
			? `${import.meta.env.VITE_NUBBLE_SERVER}/posts/${post.id}`
			: `${import.meta.env.VITE_NUBBLE_SERVER}/posts`

		try {
			const res = await axios({
				method,
				url,
				data: {
					title: markdownTitle,
					content: markdownContent,
					boardId,
					status: 'PUBLISHED',
					thumbnailUrl: thumbnail,
					description,
				},

				headers: {
					'Content-Type': 'application/json',
					'SESSION-ID': sessionId,
				},
			})
			const { postId } = res.data
			navigate(
				isEditing
					? `/postDetail/${boardId === 0 ? '코딩테스트' : '스터디'}/@${userId}/${encodeURIComponent(markdownTitle)}/${post.id}`
					: `/postDetail/${boardId === 0 ? '코딩테스트' : '스터디'}/@${userId}/${encodeURIComponent(markdownTitle)}/${postId}`,
			)
			ShowToast('게시물이 성공적으로 등록되었습니다.', 'success')
			reset()
		} catch (error) {
			console.log('미리보기페이지 등록 에러 .................', error)
		}
	}

	return (
		<Container>
			<Title>게시물 미리보기</Title>
			<PreviewContainer>
				<ThumnailContainer>
					<div className="image-span">
						<span onClick={handleThumnailReupload}>재업로드</span>
						<input
							type="file"
							accept="image/*"
							ref={fileRef}
							style={{ display: 'none' }}
							onChange={handleThumnaileChange}
						/>
						<span onClick={handleThumnailDelete}>제거</span>
					</div>
					<div
						className="thumnail-upload"
						style={{
							backgroundImage: thumbnail ? `url(${thumbnail})` : 'none',
							backgroundSize: 'cover',
							backgroundPosition: 'center',
						}}
					>
						{!thumbnail && (
							<>
								<ImagePlus size={200} strokeWidth={1} color={colors.deleteGray} />
								<form>
									<label htmlFor="thumbnailImg" className="img-label">
										썸네일 업로드
									</label>
									<input
										type="file"
										accept="image/*"
										id="thumbnailImg"
										className="img-input"
										onChange={handleThumnaileChange}
									/>
								</form>
							</>
						)}
					</div>
				</ThumnailContainer>
				<Line />
				<PostPreviewContainer>
					<div className="post-title">{markdownTitle}</div>
					<textarea
						placeholder="게시글 요약을 써주세요."
						value={description}
						onChange={onChangeTextarea}
						className="post-content"
					/>
					<span className="count">{description.length}/150</span>
				</PostPreviewContainer>
			</PreviewContainer>
			<ButtonContainer>
				<Button variant="secondary" radius={50} onClick={handleBack}>
					취소
				</Button>
				<Button radius={50} onClick={handleSubmit}>
					등록하기
				</Button>
			</ButtonContainer>
		</Container>
	)
}

const Container = styled.div`
	width: 100%;
	height: calc(100vh - 100px);
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`

const Title = styled.div`
	font-size: ${fontSize.xxxxxl};
	font-weight: ${fontWeight.semiBold};
	margin-bottom: 54px;
`

const PreviewContainer = styled.div`
	display: flex;
	justify-content: center;
	align-items: center;
	margin-bottom: 40px;
`

const ThumnailContainer = styled.div`
	position: relative;
	.thumnail-upload {
		width: 456px;
		height: 260px;
		background-color: ${colors.mainGray};
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	.image-span {
		position: absolute;
		top: -30px;
		left: 350px;
		color: ${colors.commentGray};

		span {
			margin-left: 10px;
			cursor: pointer;

			&:hover {
				color: ${colors.white};
			}
		}
	}

	.img-label {
		background-color: ${colors.bgBlack};
		color: ${colors.primaryBlue};
		padding: 8px 40px;
		border-radius: 5px;
		cursor: pointer;
		display: inline-block;
		font-weight: ${fontWeight.semiBold};

		&:hover {
			background-color: ${colors.mainBlack};
			font-weight: ${fontWeight.extraBold};
		}
	}

	.img-input {
		display: none;
	}
`

const Line = styled.div`
	height: 432px;
	width: 1px;
	background-color: ${colors.commentGray};
	margin: 0 28px;
`

const PostPreviewContainer = styled.div`
	position: relative;

	.post-title {
		position: absolute;
		top: -50px;
		font-size: ${fontSize.xxxl};
		font-weight: ${fontWeight.bold};
		color: #d9d9d9;
	}

	.post-content {
		width: 456px;
		height: 260px;
		background-color: ${colors.mainGray};
		border: none;
		color: ${colors.commentGray};
		padding: 24px 14px;
		font-size: ${fontSize.md};
	}

	.count {
		position: absolute;
		right: 0;
		bottom: -30px;
		display: block;
		text-align: right;
		color: ${colors.commentGray};
	}
`

const ButtonContainer = styled.div`
	width: 970px;
	display: flex;
	justify-content: end;
	text-align: right;
	gap: 10px;
`
export default PreviewPage
