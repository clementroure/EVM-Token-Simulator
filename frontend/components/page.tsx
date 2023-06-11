import Head from 'next/head'
import Appbar from '@/components/appbar'
import BottomNav from '@/components/bottom-nav'

interface Props {
	title?: string
	children: React.ReactNode
}

const Page = ({ title, children }: Props) => (
	<>
		{title ? (
			<Head>
				<title>{title}</title>
			</Head>
		) : null}

		{/* <Appbar /> */}

		<main>{children}</main>

		{/* <BottomNav /> */}
	</>
)

export default Page
