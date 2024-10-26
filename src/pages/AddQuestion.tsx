import styled from '@emotion/styled'
import React, { useState, useEffect } from 'react'
import colors from '@/constants/color'
import Button from '@components/Button'
import { fontSize } from '@/constants/font'
import { Trash2 } from 'lucide-react'
import axios from 'axios'
import { useAuthStore } from '@/stores/authStore'

interface Question {
	id: number
	quizDate: string
	problemTitle: string
	problemUrl?: string
}

const AddQuestion = () => {
	const [formData, setFormData] = useState<Question>({
		id: 0,
		quizDate: '',
		problemTitle: '',
		problemUrl: '',
	})

	const { sessionId } = useAuthStore()
	const [questions, setQuestions] = useState<Question[]>([])
	const [isButtonDisabled, setIsButtonDisabled] = useState(true)

	// formData 상태가 변할 때마다 버튼 비활성화 여부를 갱신
	useEffect(() => {
		const { quizDate, problemTitle, problemUrl } = formData
		if (quizDate && problemTitle && problemUrl) {
			setIsButtonDisabled(false)
		} else {
			setIsButtonDisabled(true)
		}
	}, [formData])

	// 서버에서 문제 리스트를 가져오는 useEffect
	useEffect(() => {
		const getCodingTestList = async () => {
			try {
				const res = await axios.get(`${import.meta.env.VITE_NUBBLE_SERVER}/coding-problems`)
				const data = res.data.problems.map((problem: any) => ({
					id: problem.problemId, // problemId 필드를 id로 저장
					quizDate: problem.quizDate,
					problemTitle: problem.problemTitle,
				}))
				setQuestions(data)
			} catch (error) {
				console.error(error)
			}
		}
		getCodingTestList()
	}, [])

	// 입력 필드 값 변경 핸들러
	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setFormData((prevFormData) => ({
			...prevFormData,
			[name]: value,
		}))
	}

	// 문제 추가 버튼 클릭 핸들러
	const handleAddQuestion = async (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault()

		const { quizDate, problemTitle, problemUrl } = formData
		if (quizDate && problemTitle && problemUrl) {
			try {
				// 문제 추가 요청을 서버에 보냄
				const res = await postCodingTest()

				// 문제가 성공적으로 추가되면 questions에 추가
				setQuestions((prevQuestions) => [
					...prevQuestions,
					{ id: res.data.problemId, quizDate, problemTitle, problemUrl }, // 새 문제를 추가
				])

				// formData 초기화
				setFormData({ id: 0, quizDate: '', problemTitle: '', problemUrl: '' })

				console.log('문제 추가 성공')
			} catch (error) {
				console.error('문제 추가 중 에러 발생', error)
			}
		}
	}

	// 서버로 문제 등록 요청 보내기
	const postCodingTest = async () => {
		try {
			const res = await axios.post(
				`${import.meta.env.VITE_NUBBLE_SERVER}/coding-problems`,
				{
					quizDate: formData.quizDate,
					problemTitle: formData.problemTitle,
					problemUrl: formData.problemUrl,
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
			console.error(error)
			throw error
		}
	}

	// 문제 삭제 핸들러 (DELETE 요청 보내기)
	const handleDelete = async (id: number) => {
		try {
			// DELETE 요청을 서버로 보냄
			await axios.delete(`${import.meta.env.VITE_NUBBLE_SERVER}/coding-problems/${id}`, {
				headers: {
					'SESSION-ID': sessionId,
				},
			})

			// 성공적으로 삭제되면 클라이언트에서도 상태를 업데이트
			const updatedQuestions = questions.filter((question) => question.id !== id)
			setQuestions(updatedQuestions)

			console.log(`문제 ID ${id} 삭제 성공`)
		} catch (error) {
			console.error('문제 삭제 중 에러 발생', error)
		}
	}

	return (
		<Container>
			<Form>
				<Title>코딩테스트 문제 추가하기</Title>
				<InputZone>
					<InputDate
						type="date"
						name="quizDate"
						value={formData.quizDate}
						onChange={handleInputChange}
					/>
					<Input
						placeholder="문제 제목을 입력해주세요"
						name="problemTitle"
						value={formData.problemTitle}
						onChange={handleInputChange}
					/>
					<Input
						placeholder="문제 링크를 입력해주세요"
						name="problemUrl"
						value={formData.problemUrl}
						onChange={handleInputChange}
					/>
					{isButtonDisabled && <Warning>전부 입력했니? ^^</Warning>}
				</InputZone>
				<ButtonWrapper>
					<SubmitButton disabled={isButtonDisabled} onClick={handleAddQuestion}>
						등록하기
					</SubmitButton>
				</ButtonWrapper>
			</Form>
			<QuestionList>
				<TableHeader>
					<span>날짜</span>
					<span>문제 제목</span>
					<span></span> {/* 삭제 아이콘 자리 */}
				</TableHeader>
				{questions.map((question) => (
					<QuestionItem key={question.id}>
						<span>{question.quizDate}</span>
						<span>{question.problemTitle}</span>
						<DeleteIcon onClick={() => handleDelete(question.id)}>
							<Trash2 size={20} />
						</DeleteIcon>
					</QuestionItem>
				))}
			</QuestionList>
		</Container>
	)
}

const Container = styled.div`
	width: 100%;
	max-width: 900px;
	height: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	margin: 0 auto;
	padding: 20px;
`

const Form = styled.form`
	display: flex;
	flex-direction: column;
	justify-content: center;
	background-color: ${colors.mainGray};
	gap: 20px;
	width: 100%;
	height: 340px;
	padding: 10px;
	border-radius: 8px;
`

const Title = styled.h1`
	display: flex;
	justify-content: center;
	font-size: ${fontSize.xxxl};
	margin-top: 30px;
`

const InputZone = styled.div`
	display: flex;
	margin: 0 auto;
	flex-direction: column;
	align-items: flex-start;
	width: 100%;
	max-width: 500px;
	gap: 14px;
`

const InputDate = styled.input`
	width: 100%;
	max-width: 160px;
	height: 40px;
	padding: 8px;
	font-size: 16px;
	border-radius: 4px;
	background-color: ${colors.commentGray};
	color: #707070;
`

const Input = styled.input`
	width: 100%;
	max-width: 500px;
	height: 40px;
	padding: 8px;
	font-size: 16px;
	border-radius: 4px;
	background-color: ${colors.commentGray};
	color: white;
`

const Warning = styled.span`
	color: red;
	font-size: ${fontSize.xs};
`

const ButtonWrapper = styled.div`
	display: flex;
	justify-content: flex-end;
	margin: 0 10px 18px 0;
`

const SubmitButton = styled(Button)`
	width: 100px;
	height: 40px;
	color: white;
	font-size: 16px;
`

const QuestionList = styled.div`
	width: 100%;
	margin-top: 20px;
`

const TableHeader = styled.div`
	display: flex;
	justify-content: space-between;
	padding: 10px 0;
	border-bottom: 1px solid ${colors.commentGray};
	span {
		width: 30%;
		text-align: left;
		font-size: ${fontSize.md};
		color: white;
	}
`

const QuestionItem = styled.div`
	display: flex;
	justify-content: space-between;
	padding: 20px 0;
	border-bottom: 1px solid ${colors.commentGray};
	span {
		width: 33%;
		text-align: left;
		font-size: ${fontSize.md};
		color: white;
	}
`

const DeleteIcon = styled.div`
	color: red;
	cursor: pointer;
	margin-left: 240px;
`

export default AddQuestion
