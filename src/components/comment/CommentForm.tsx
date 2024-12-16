import colors from '@/constants/color'
import Button from '@components/Button'
import styled from '@emotion/styled'
import React, { useState, useEffect } from 'react'
import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'
import { useParams } from 'react-router-dom'

const MAX_NICKNAME_LENGTH = 6 // 닉네임 길이 제한

const CommentForm = () => {
	const { postId } = useParams<{ postId: string }>()
	const { isLogin, userName } = useAuthStore()
	const { sessionId } = useAuthStore()

	// 닉네임, 비밀번호, 댓글 입력값 상태 관리
	const [formData, setFormData] = useState({
		nickname: '',
		password: '',
		comment: '',
	})
	const [isButtonDisabled, setIsButtonDisabled] = useState(true)
	const [nicknameError, setNicknameError] = useState('') // 경고 문구 상태 관리
	//const [submitSuccess, setSubmitSuccess] = useState(false) // 제출 성공 여부 상태

	// 모든 입력 필드가 채워졌는지 확인하는 로직
	useEffect(() => {
		const { nickname, password, comment } = formData

		// 닉네임 길이 체크
		if (!isLogin && nickname.length > MAX_NICKNAME_LENGTH) {
			setNicknameError(`닉네임은 ${MAX_NICKNAME_LENGTH}글자까지 입력 가능합니다.`)
		} else {
			setNicknameError('')
		}

		// 버튼 활성화 로직
		if ((nickname || isLogin) && (isLogin || password) && comment && !nicknameError) {
			setIsButtonDisabled(false)
		} else {
			setIsButtonDisabled(true)
		}
	}, [formData, isLogin, nicknameError])

	// input과 textarea의 값이 변경될 때 상태를 업데이트
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		const { name, value } = e.target
		setFormData((prevFormData) => ({
			...prevFormData,
			[name]: value,
		}))
	}

	// 폼이 제출될 때 실행되는 함수
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()

		// 로그인된 상태일 경우 userName을 nickname으로 설정
		// const submittedData = {
		// 	...formData,
		// 	nickname: isLogin ? userName : formData.nickname,
		// }

		try {
			if (!isLogin) {
				const res = await postGuestComment()
				console.log('비로그인 댓글 제출', res.data)
			} else {
				const res = await postMemberComment()
				console.log('멤버 댓글 제출', res.data)
			}
			//setSubmitSuccess(true)
			setFormData({ nickname: '', password: '', comment: '' })
		} catch (error) {
			console.error('Error submitting comment:', error)
			//setSubmitSuccess(false)
		}
	}

	//로그인 유저 댓글 작성
	const postMemberComment = async () => {
		try {
			const res = await axios.post(
				`http://nubble-backend-eb-1-env.eba-f5sb82hp.ap-northeast-2.elasticbeanstalk.com/posts/${postId}/comments/member`,
				{
					content: formData.comment,
				},
				{
					headers: {
						'Content-Type': 'application/json',
						'SESSION-ID': sessionId,
					},
				},
			)
			return res
		} catch (error) {
			console.error('Error submitting member comment:', error)
			throw error
		}
	}

	//비로그인 댓글작성
	const postGuestComment = async () => {
		try {
			const res = await axios.post(
				`http://nubble-backend-eb-1-env.eba-f5sb82hp.ap-northeast-2.elasticbeanstalk.com/posts/${postId}/comments/guest`,
				{
					content: formData.comment,
					guestName: formData.nickname,
					guestPassword: formData.password,
				},
				{
					headers: {
						'Content-Type': 'application/json',
					},
				},
			)
			return res
		} catch (error) {
			console.error(error)
			throw error
		}
	}

	return (
		<Form onSubmit={handleSubmit}>
			<InputZone>
				<Input
					name="nickname"
					placeholder={isLogin ? userName || '' : '닉네임'}
					value={formData.nickname}
					onChange={handleInputChange}
					disabled={isLogin}
					hasError={!!nicknameError} // nicknameError가 있을 때만 빨간 테두리 적용
				/>
				{!isLogin && (
					<Input
						name="password"
						type="password"
						placeholder="비밀번호"
						value={formData.password}
						onChange={handleInputChange}
					/>
				)}
			</InputZone>

			{/* 닉네임 에러 메시지 */}
			{nicknameError && <ErrorMessage>{nicknameError}</ErrorMessage>}

			<Textarea
				name="comment"
				placeholder="댓글을 작성하세요"
				value={formData.comment}
				onChange={handleInputChange}
			/>
			<ButtonWrapper>
				<Button type="submit" disabled={isButtonDisabled}>
					등록하기
				</Button>
			</ButtonWrapper>
		</Form>
	)
}

const Form = styled.form`
	display: flex;
	flex-direction: column;
	gap: 10px;
	width: 100%;
`
const InputZone = styled.div`
	display: flex;
	gap: 12px;
`

const Input = styled.input<{ hasError?: boolean }>`
	padding: 6px 10px;
	border-radius: 5px;
	border: 1px solid ${(props) => (props.hasError ? 'red' : colors.bgBlack)}; // 오류가 있을 때 빨간 테두리
	background-color: ${colors.mainGray};
	width: 100px;
	color: white;

	// 포커스 상태에서도 테두리가 붉게 유지되도록
	&:focus {
		outline: none;
		border-color: ${(props) => (props.hasError ? 'red' : colors.bgBlack)};
	}
`

const Textarea = styled.textarea`
	padding: 10px;
	border-radius: 5px;
	border: 1px solid ${colors.bgBlack};
	background-color: ${colors.mainGray};
	color: white;
	resize: none;
	height: 95px;
`

const ButtonWrapper = styled.div`
	display: flex;
	justify-content: flex-end;
`

const ErrorMessage = styled.div`
	color: red;
	font-size: 12px;
	margin-top: 5px;
`

export default CommentForm
