import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ImagePlus, ArrowLeft } from 'lucide-react'
import styled from '@emotion/styled'
import axios from 'axios'
import colors from '@/constants/color'
import { fontSize, fontWeight } from '@/constants/font'
import Button from '@components/Button'
import RenderMarkdown from '@components/RenderMarkdown'
import SelectBox from '@components/SelectBox'
import useCategory from '@/hooks/useCategory'
import useFileUpload from '@/hooks/useFileUpload'
import { useWriteStore } from '@/stores/writeStore'
import useWrite from '@/hooks/useWrite'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'react-toastify'
import Toast from '@components/Toast'

const WritePage = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const { state } = useLocation()
	const queryParams = new URLSearchParams(location.search)
	const id = queryParams.get('id')
	const fileRef = useRef<HTMLInputElement>(null)
	const readRef = useRef<HTMLDivElement>(null)
	const [isEditing, setIsEditing] = useState(false)
	const {
		categories,
		boards,
		category,
		board,
		setCategory,
		setBoard,
		handleSelectedData,
		handleSubData,
	} = useCategory()
	const {
		markdownContent,
		markdownTitle,
		boardId,
		setTitle,
		setContent,
		setThumbnail,
		setBoardId,
		setDescription,
		reset,
	} = useWrite()
	const { uploadFile } = useFileUpload()
	const { sessionId } = useAuthStore()
	const [post, setPost] = useState(state?.postData || null)

	const handleUploadFile = () => {
		if (fileRef.current) {
			fileRef.current.click()
		}
	}

	const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files
		if (files) {
			const newImages: string[] = []

			for (const file of files) {
				try {
					const res = await uploadFile(file)
					newImages.push(`![](${res.baseUrl + res.fileName})`)
				} catch (error) {
					return
				}
			}
			const currentState = useWriteStore.getState().content
			setContent(currentState + newImages.join('\n'))
		}
	}

	const handlePaste = async (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
		const items = e.clipboardData.items
		let newContent = markdownContent

		for (let item of items) {
			if (item.kind === 'file' && item.type.startsWith('image/')) {
				const file = item.getAsFile()
				if (file) {
					const res = await uploadFile(file)
					newContent += `![](${res.baseUrl + res.fileName})`
					e.preventDefault()
				}
			}
		}
		setContent(newContent)
	}

	const handleContent = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		setContent(e.target.value)

		if (readRef.current) {
			readRef.current.scrollTop = readRef.current.scrollHeight
		}
	}

	const handleBack = () => {
		reset()
		navigate(-1)
	}

	const handleSubmit = () => {
		setTitle(markdownTitle)
		setContent(markdownContent)
		setThumbnail(markdownContent)
		setDescription(markdownContent)
		setCategory(category)
		setBoard(board)

		navigate('/preview', {
			state: {
				isEditing,
				post: { title: markdownTitle, content: markdownContent, category, board, id },
			},
		})
	}

	const handleDraft = async () => {
		try {
			const res = await axios.post(
				`${import.meta.env.VITE_NUBBLE_SERVER}/posts`,
				{
					title: markdownTitle,
					content: markdownContent,
					boardId,
					status: 'DRAFT',
					description: markdownContent.slice(0, 10),
				},
				{
					headers: {
						'Content-Type': 'application/json',
						'SESSION-ID': sessionId,
					},
				},
			)
			toast.success('임시저장이 완료되었습니다.✨')
			return res
		} catch (error) {
			toast.error('임시저장에 실패했는데요?😱')
		}
	}

	useEffect(() => {
		if (id && post) {
			setIsEditing(true)

			setTitle(post.title)
			setContent(post.content)
			setCategory(post.category)
			setBoard(post.subCategory)
		}
	}, [id, post])

	useEffect(() => {
		if (category) {
			setBoardId(Number(category))
		}
	}, [category])

	return (
		<Container>
			<Toast />
			<div className="area-write">
				<input
					className="write-markdownTitle"
					type="text"
					value={markdownTitle}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="제목을 입력하세요"
				/>
				<div className="gray-line" />
				<div className="area-choice">
					<input
						type="file"
						multiple
						ref={fileRef}
						style={{ display: 'none' }}
						onChange={handleFileChange}
					/>
					<IconButton onClick={handleUploadFile}>
						<ImagePlus size={30} />
						이미지 업로드
					</IconButton>
					<div className="select-category">
						<SelectBox
							options={categories}
							selectedValue={category}
							placeholder="카테고리 선택"
							handleChange={handleSelectedData}
						/>
						<SelectBox
							options={boards}
							selectedValue={board}
							placeholder="내용 선택"
							handleChange={handleSubData}
							disabled={boards.length === 0 || !category}
						/>
					</div>
				</div>
				<textarea
					className="content"
					placeholder="내용을 입력하세요."
					value={markdownContent}
					onChange={handleContent}
					onPaste={handlePaste}
				/>
				<div className="area-footer">
					<IconButton onClick={handleBack}>
						<ArrowLeft size={25} />
						나가기
					</IconButton>
					<div className="area-button">
						<Button
							variant="secondary"
							radius={50}
							onClick={handleDraft}
							disabled={!(markdownTitle && markdownContent && category && board)}
						>
							임시저장
						</Button>
						{isEditing ? (
							<Button
								radius={50}
								onClick={handleSubmit}
								disabled={!(markdownTitle && markdownContent && category && board)}
							>
								수정하기
							</Button>
						) : (
							<Button
								radius={50}
								onClick={handleSubmit}
								disabled={!(markdownTitle && markdownContent && category && board)}
							>
								등록하기
							</Button>
						)}
					</div>
				</div>
			</div>
			<div ref={readRef} className="area-read">
				<div className="markdownTitle">{markdownTitle}</div>
				<RenderMarkdown markdown={markdownContent} />
			</div>
		</Container>
	)
}

export default WritePage

const Container = styled.div`
	width: 100%;
	height: 100vh;
	display: flex;

	input::placeholder {
		color: ${colors.commentGray};
	}

	.content,
	.write-markdownTitle {
		color: ${colors.white};
	}

	.content::-webkit-scrollbar,
	.area-read::-webkit-scrollbar {
		width: 8px;
	}

	.content::-webkit-scrollbar-thumb,
	.area-read::-webkit-scrollbar-thumb {
		background-color: ${colors.white};
		border-radius: 4px;
	}

	.area-write {
		position: relative;
		width: 100%;
		padding: 0px 30px;
		background-color: ${colors.bgBlack};
		padding-bottom: 70px;

		.write-markdownTitle {
			width: 100%;
			font-size: ${fontSize.xxxxxl};
			font-weight: ${fontWeight.semiBold};
			background-color: inherit;
			outline: none;
			margin: 40px 0px 30px;
		}

		textarea {
			border: none;
			outline: none;
		}

		.content {
			width: 100%;
			overflow-y: auto;
			font-size: ${fontSize.lg};
			background-color: inherit;
			border: none;
			padding: 10px;
			resize: none;
			height: calc(100vh - 260px);
		}
	}

	.gray-line {
		width: 100%;
		height: 3px;
		background-color: ${colors.commentGray};
	}

	.area-choice,
	.area-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.area-choice {
		margin: 20px 0;

		.select-category {
			display: flex;
			gap: 10px;
		}
	}

	.area-exit {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.area-read {
		width: 100%;
		overflow-y: auto;
		flex-direction: column;
		padding: 40px;
		line-height: 1.3;
		background-color: ${colors.mainBlack};
		font-size: ${fontSize.md};

		.markdownTitle {
			font-size: ${fontSize.xxxxxl};
			font-weight: ${fontWeight.semiBold};
			margin-bottom: 50px;
		}
	}

	.area-footer {
		width: 100%;
		height: 70px;
		position: absolute;
		padding: 0px 30px;
		background-color: ${colors.mainGray};
		left: 0;
		bottom: 0;

		.area-button {
			display: flex;
			gap: 10px;
		}
	}
`
const IconButton = styled.button`
	display: flex;
	align-items: center;
	gap: 8px;
	background-color: inherit;
	color: ${colors.commentGray};
	border: none;
	cursor: pointer;
	font-size: ${fontSize.lg};
	font-weight: ${fontWeight.regular};

	&:hover {
		color: ${colors.white};
	}
`
