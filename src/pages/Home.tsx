import React, { useEffect, useState } from 'react'
import styled from '@emotion/styled'
import BestContents from '@components/BestContents'
import Banner from '@components/Banner'
import colors from '@/constants/color'
import { fontSize, fontWeight } from '@/constants/font'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'
import { useCoteData } from '@/hooks/useCoteData'
import { formatDate } from '@/utils/formatDate'
import defaultImage from '@/assets/defaultImage.jpeg'
import Loading from '@components/Loading'

interface Post {
	createdAt: string
	description: string
	id: number
	thumbnailUrl: string
	title: string
	username: string
}

const Home: React.FC = () => {
	const { isLogin } = useAuthStore()
	const navigate = useNavigate()
	const login = useAuthStore((state) => state.login)
	const { commitData } = useCoteData()
	const [studyBoards, setStudyBoards] = useState<Post[]>([])
	const [selectedTab, setSelectedTab] = useState<'cote' | 'study'>('cote')
	const [selectedLv, setSelectedLv] = useState<string | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		const getUserInfo = async () => {
			const sessionId = localStorage.getItem('sessionId')

			if (!sessionId) {
				console.error('session Id ❌')
				return
			}

			try {
				const res = await axios.get(`${import.meta.env.VITE_NUBBLE_SERVER}/users/me`, {
					headers: {
						'Content-Type': 'application/json',
						'SESSION-ID': sessionId,
					},
				})
				localStorage.setItem('userName', res.data.nickname)
				localStorage.setItem('userId', res.data.username)
				login(sessionId, res.data.username, res.data.nickname)
			} catch (error) {
				console.log('유저 정보 가져오기 ERROR---->', error)
			}
		}
		getUserInfo()
	}, [login])

	const filteredCommitData = commitData.filter((data) => {
		if (!selectedLv) return true
		return data.title.startsWith(selectedLv)
	})

	useEffect(() => {
		const startTime = performance.now()
		const getPost = async () => {
			try {
				const res = await axios.get(`${import.meta.env.VITE_NUBBLE_SERVER}/boards/1`, {
					headers: {
						'Content-Type': 'application/json',
					},
				})
				// console.log(res.data.posts)
				setStudyBoards(res.data.posts)
				const endTime = performance.now()
				const duration = endTime - startTime
				// console.log(`Study API 호출 소요 시간: ${duration.toFixed(2)}ms`)
			} catch (error) {
				console.log('스터디 게시글 가져오기 에러------->', error)
			} finally {
				setLoading(false)
			}
		}

		getPost()
	}, [])

	return (
		<Container>
			<Banner />
			<ContentContainer>
				<PostContainer>
					<div className="menu">
						<div className="menu-list">
							<MenuItem isSelected={selectedTab === 'cote'} onClick={() => setSelectedTab('cote')}>
								코딩테스트
							</MenuItem>
							<MenuItem
								isSelected={selectedTab === 'study'}
								onClick={() => setSelectedTab('study')}
							>
								스터디
							</MenuItem>
						</div>
						{isLogin && (
							<button
								className="write-btn"
								onClick={() => {
									navigate('/write')
								}}
							>
								+ 글쓰기
							</button>
						)}
					</div>
					{selectedTab === 'cote' && (
						<div className="cote-posts">
							{loading ? (
								<Loading />
							) : (
								<div>
									<div className="category">
										{['Lv0', 'Lv1', 'Lv2', 'Lv3'].map((level) => (
											<CategoryItem
												key={level}
												isSelected={selectedLv === level}
												onClick={() => setSelectedLv(level)}
											>
												{level}
											</CategoryItem>
										))}
									</div>
									<ul>
										{filteredCommitData.map((data) => (
											<Link
												to={`/postDetail/코딩테스트/@${data.author}/${data.title}`}
												key={`${data.title}-${data.author}`}
											>
												<li className="post-list">
													<div>
														<div className="title-container">
															<div className="title">{data.title}</div>
															<div className="post-info">
																<div className="author">{data.author}</div>
																<div className="date">{formatDate(data.date)}</div>
															</div>
														</div>
														<div className="content">{data.content}</div>
													</div>
												</li>
											</Link>
										))}
									</ul>
								</div>
							)}
						</div>
					)}

					{selectedTab === 'study' && (
						<div className="study-posts">
							{loading ? (
								<Loading />
							) : (
								<ul>
									{studyBoards
										.map((data) => (
											<Link
												to={`/postDetail/스터디/@${data.username}/${encodeURIComponent(data.title)}/${data.id}`}
												key={data.id}
											>
												<li className="post-list">
													<img
														src={data.thumbnailUrl !== '' ? data.thumbnailUrl : defaultImage}
														alt={data.title}
													/>
													<div>
														<div className="post-info">
															<div className="author">{data.username}</div>
															<div className="date">{data.createdAt.slice(0, 10)}</div>
														</div>
														<div className="title">{data.title}</div>
														<div className="content">{data.description}</div>
													</div>
												</li>
											</Link>
										))
										.reverse()}
								</ul>
							)}
						</div>
					)}
				</PostContainer>
				<BestContentsContainer>
					<BestContents />
					<BestContents />
				</BestContentsContainer>
			</ContentContainer>
		</Container>
	)
}

const Container = styled.div`
	width: 100%;
	height: 100%;
	background-color: ${colors.bgBlack};
	max-width: 1080px;
	margin: 20px auto;
`

const ContentContainer = styled.div`
	display: flex;
	margin-top: 50px;
`

const PostContainer = styled.div`
	flex-grow: 1;
	margin-right: 40px;
	padding-right: 40px;
	border-right: 1px solid ${colors.white};

	.cote-posts {
		height: 100vh;
		padding-right: 60px;
		max-height: 80%;
		overflow-y: auto;

		.title-container {
			width: 620px;
			display: flex;
			justify-content: space-between;

			.author {
				font-size: ${fontSize.sm};
			}
			.date {
				font-size: ${fontSize.sm};
			}
		}

		.content {
			width: 620px;
			&:hover {
				color: ${colors.white};
			}
		}
	}

	.study-posts {
		height: 100vh;
		padding-right: 60px;
		max-height: 80%;
		overflow-y: auto;
	}

	.menu {
		display: flex;
		justify-content: space-between;
		color: ${colors.commentGray};
		font-size: ${fontSize.xxl};
		padding-bottom: 20px;
		border-bottom: 2px solid ${colors.commentGray};
		margin-bottom: 20px;

		.menu-list {
			display: flex;
		}

		.write-btn {
			background-color: transparent;
			color: ${colors.white};
			font-size: ${fontSize.lg};

			&:hover {
				font-weight: ${fontWeight.bold};
			}
		}
	}

	.category {
		display: flex;
		margin-bottom: 30px;
	}

	.post-list {
		display: flex;
		margin-bottom: 40px;
		cursor: pointer;
		transition:
			transform 0.3s ease,
			border-radius 0.3s ease;

		img {
			min-width: 154px;
			max-width: 154px;
			height: 118px;
			margin-right: 30px;
		}

		.post-info {
			display: flex;
			font-size: ${fontSize.md};
			color: ${colors.commentGray};
			margin-bottom: 20px;

			div:first-of-type::after {
				content: '•';
				margin: 0 8px;
			}
		}

		.title {
			font-size: ${fontSize.xl};
			font-weight: ${fontWeight.semiBold};
			margin-bottom: 20px;
		}

		.content {
			color: ${colors.commentGray};
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		&:hover {
			.content {
				color: ${colors.white};
			}
			border-radius: 10px;
			transform: scale(1.01);
		}
	}

	.cote-posts::-webkit-scrollbar,
	.study-posts::-webkit-scrollbar {
		width: 8px;
	}

	.cote-posts::-webkit-scrollbar-thumb,
	.study-posts::-webkit-scrollbar-thumb {
		background-color: ${colors.white};
		border-radius: 4px;
	}
`

const MenuItem = styled.div<{ isSelected: boolean }>`
	margin-right: 20px;
	cursor: pointer;
	color: ${({ isSelected }) => (isSelected ? colors.white : colors.commentGray)};
	font-weight: ${({ isSelected }) => (isSelected ? fontWeight.bold : fontWeight.regular)};

	&:hover {
		color: ${colors.white};
		font-weight: ${fontWeight.bold};
	}
`

const CategoryItem = styled.div<{ isSelected: boolean }>`
	margin-right: 14px;
	font-size: ${fontSize.lg};
	color: ${({ isSelected }) => (isSelected ? colors.white : colors.commentGray)};
	font-weight: ${({ isSelected }) => (isSelected ? fontWeight.bold : fontWeight.regular)};
	cursor: pointer;

	&:hover {
		color: ${colors.white};
		font-weight: ${fontWeight.bold};
	}
`

const BestContentsContainer = styled.div``

export default Home
