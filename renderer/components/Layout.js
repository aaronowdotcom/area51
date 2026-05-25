import Sidebar from './Sidebar'
import Head from 'next/head'

export default function Layout({ children, title = 'NexaFlow Sales Kit' }) {
  return (
    <>
      <Head>
        <title>{title} | NexaFlow</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="flex h-screen overflow-hidden bg-dark-900">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </>
  )
}
