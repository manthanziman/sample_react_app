import { useState } from 'react'
import { gql } from '@apollo/client'
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react'
import './App.css'

const CURRENT_USER = gql`
  query CurrentUser {
    me {
      id
      name
      email
      role
    }
  }
`

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    loginAdmin(email: $email, password: $password) {
      user {
        id
        name
        email
        role
      }
    }
  }
`

const SIGN_UP = gql`
  mutation SignUp($name: String!, $email: String!, $password: String!) {
    signUpAdmin(name: $name, email: $email, password: $password) {
      user {
        id
        name
        email
        role
      }
    }
  }
`

const LOGOUT = gql`
  mutation Logout {
    logout
  }
`

function App() {
  const client = useApolloClient()
  const { data, loading, error } = useQuery(CURRENT_USER, { fetchPolicy: 'network-only' })
  const [login, { loading: loggingIn }] = useMutation(LOGIN)
  const [signUp, { loading: signingUp }] = useMutation(SIGN_UP)
  const [logout, { loading: loggingOut }] = useMutation(LOGOUT)
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [signedOut, setSignedOut] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState('')

  const user = signedOut ? null : data?.me

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')

    if (isSigningUp && password !== confirmPassword) {
      setFormError('Passwords do not match.')
      return
    }

    try {
      if (isSigningUp) {
        await signUp({ variables: { name: name.trim(), email: email.trim(), password } })
      } else {
        await login({ variables: { email: email.trim(), password } })
      }
      setSignedOut(false)
      await client.refetchQueries({ include: [CURRENT_USER] })
    } catch (submitError) {
      setFormError(submitError.message || 'Unable to authenticate. Please try again.')
    }
  }

  async function handleLogout() {
    setFormError('')
    try {
      await logout()
      await client.clearStore()
      setSignedOut(true)
    } catch (logoutError) {
      setFormError(logoutError.message || 'Unable to sign out. Please try again.')
    }
  }

  if (loading) {
    return <main className="page"><p role="status">Loading…</p></main>
  }

  if (user) {
    return (
      <main className="page">
        <section className="card">
          <div className="brand">AUTH<span>.</span></div>
          <h1>You're in.</h1>
          <p>Welcome, {user.name}.</p>
          <button className="button" disabled={loggingOut} onClick={handleLogout}>
            {loggingOut ? 'Signing out…' : 'Sign out'}
          </button>
          {formError && <p className="error" role="alert">{formError}</p>}
        </section>
      </main>
    )
  }

  const sessionError = error && !error.message.includes('Authentication required')

  return (
    <main className="page">
      <section className="card">
        <div className="brand">AUTH<span>.</span></div>
        <h1>{isSigningUp ? 'Create account' : 'Welcome back'}</h1>
        <p className="subtitle">{isSigningUp ? 'Sign up to get started.' : 'Log in to continue.'}</p>

        {(formError || sessionError) && (
          <p className="error" role="alert">
            {formError || 'Could not connect to the authentication service.'}
          </p>
        )}

        <form onSubmit={handleSubmit}>
          {isSigningUp && (
            <label>
              Name
              <input
                autoComplete="name"
                onChange={(event) => setName(event.target.value)}
                required
                value={name}
              />
            </label>
          )}
          <label>
            Email
            <input
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label>
            Password
            <input
              autoComplete={isSigningUp ? 'new-password' : 'current-password'}
              minLength={8}
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
          {isSigningUp && (
            <label>
              Confirm password
              <input
                autoComplete="new-password"
                minLength={8}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                type="password"
                value={confirmPassword}
              />
            </label>
          )}
          <button className="button" disabled={loggingIn || signingUp} type="submit">
            {loggingIn || signingUp ? 'Please wait…' : isSigningUp ? 'Sign up' : 'Log in'}
          </button>
        </form>

        <p className="switch-mode">
          {isSigningUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => {
              setIsSigningUp((current) => !current)
              setFormError('')
            }}
            type="button"
          >
            {isSigningUp ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </section>
    </main>
  )
}

export default App
