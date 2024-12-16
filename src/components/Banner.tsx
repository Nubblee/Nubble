import styled from '@emotion/styled'
import { useNavigate } from 'react-router-dom'
import colors from '../constants/color'
import { fontSize, fontWeight } from '../constants/font'
import dayjs from 'dayjs'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Pagination, Navigation } from 'swiper/modules'
import { ArrowUpRight } from 'lucide-react'
import { Plus } from 'lucide-react'
import { useAuthStore } from '@/stores/authStore'
import 'swiper/swiper-bundle.css'
import axios from 'axios'
import { useEffect, useState } from 'react'

export interface coteDataProps {
	problemId: number
	quizDate: string
	problemTitle: string
	url: string
}

const formatDate = (date: Date) => {
	return dayjs(date).locale('ko').format('YYYY년 MM월 DD일')
}

const Banner = () => {
	const { isLogin } = useAuthStore()
	const navigate = useNavigate()
	const [coteData, setCoteData] = useState<coteDataProps[]>([])
	const [noneData, setNoneData] = useState('')
	const todayDate = dayjs(new Date()).format('YYYY-MM-DD')

	const getCoteData = async () => {
		const res = await axios.get(
			`${import.meta.env.VITE_NUBBLE_SERVER}/coding-problems?quizDate=${todayDate}`,
		)
		return res.data.problems
	}

	useEffect(() => {
		const fetchCoteData = async () => {
			const todayCote = await getCoteData()
			if (todayCote.length > 0) {
				setCoteData(todayCote)
			} else {
				setNoneData('오늘의 문제가 아직 등록되지 않았습니다.')
			}
		}
		fetchCoteData()
	}, [])

	return (
		<BannerWrapper>
			<BannerTop>
				<BannerDate> {formatDate(new Date())} 오늘의 문제</BannerDate>
				{isLogin && (
					<BannerBtn
						onClick={() => {
							navigate('/AddQuestion')
						}}
					>
						<Plus size={20} />
						문제 추가하기
					</BannerBtn>
				)}
			</BannerTop>
			<SwiperContainer>
				<Swiper
					slidesPerView={1}
					slidesPerGroup={1}
					spaceBetween={30}
					loop={coteData.length > 0}
					pagination={{
						clickable: true,
					}}
					navigation={true}
					modules={[Pagination, Navigation]}
					className="my-swiper"
				>
					{coteData.length > 0 ? (
						coteData.map((code) => (
							<SwiperSlide key={code.problemId}>
								<BannerComponent>
									<BannerTitle>
										<a href={code.url} target="_blank">
											{code.problemTitle}
											<ArrowUpRight size={30} viewBox="0 0 20 20" />
										</a>
									</BannerTitle>
								</BannerComponent>
							</SwiperSlide>
						))
					) : (
						<BannerComponent>
							<BannerTitle>{noneData}</BannerTitle>
						</BannerComponent>
					)}
				</Swiper>
			</SwiperContainer>
		</BannerWrapper>
	)
}

export default Banner

const BannerWrapper = styled.div`
	width: 100%;
	background-color: ${colors.mainGray};
	border-radius: 10px;
	padding-top: 30px;
`
const BannerTop = styled.div`
	display: flex;
	height: 15px;
	justify-content: space-between;
	align-items: center;
	padding: 0 80px;
`
const SwiperContainer = styled.div`
	width: 100%;
	background-color: ${colors.mainGray};
	border-radius: 10px;
	box-shadow: 0px 5px 5px -3px rgba(255, 255, 255, 0.5);

	.swiper-pagination {
		bottom: 15px !important;

		.swiper-pagination-bullet {
			color: ${colors.commentGray};
		}

		.swiper-pagination-bullet-active {
			background-color: ${colors.commentGray};
		}
	}

	.swiper-button-next,
	.swiper-button-prev {
		color: #fff;
		width: 44px;
		height: 44px;
		font-size: 24px;
		transform: translateY(-30%);
	}

	.swiper-button-next::after,
	.swiper-button-prev::after {
		font-size: 24px;
	}

	.swiper-button-next {
		right: 10px !important;
	}

	.swiper-button-prev {
		left: 10px !important;
	}
`

const BannerComponent = styled.div`
	height: 100px;
	padding: 10px 80px;
`

const BannerDate = styled.div`
	color: ${colors.primaryBlue};
	font-size: ${fontSize.lg};
	font-weight: ${fontWeight.medium};
`
const BannerBtn = styled.div`
	display: flex;
	gap: 3px;
	font-size: ${fontSize.lg};
	align-items: center;
	cursor: pointer;

	&:hover {
		font-weight: ${fontWeight.bold};
	}
`
const BannerTitle = styled.div`
	display: flex;
	padding-top: 10px;
	gap: 10px;
	font-size: ${fontSize.xxxxl};
	font-weight: ${fontWeight.medium};
`
