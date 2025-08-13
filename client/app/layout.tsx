import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import { Toaster } from 'react-hot-toast'
import { LayoutWrapper } from '@/components/layout/LayoutWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Real-Time Notes',
  description: 'Collaborative note-taking app with real-time editing',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#fff',
                border: '3px solid #000',
                borderRadius: '12px',
                fontWeight: 'bold',
                boxShadow: '4px 4px 0px #000',
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
