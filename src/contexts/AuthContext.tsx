import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
  ConfirmSignUpCommand,
  GlobalSignOutCommand,
  GetUserCommand,
  AdminGetUserCommand,
  AdminGetUserCommandOutput,
  AttributeType
} from '@aws-sdk/client-cognito-identity-provider';
import { User, AuthState } from '../types';
import { cognitoClient, USER_POOL_ID, USER_POOL_CLIENT_ID } from '../aws-config';

interface AuthContextType {
  authState: AuthState;
  viewAsStudent: boolean;
  toggleViewAsStudent: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  confirmSignUp: (email: string, code: string) => Promise<void>;
}

const initialAuthState: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
  error: null
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>(initialAuthState);
  const [viewAsStudent, setViewAsStudent] = useState<boolean>(false);
  
  const toggleViewAsStudent = () => {
    setViewAsStudent(prev => !prev);
  };

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      // Get the stored tokens
      const idToken = localStorage.getItem('idToken');
      const accessToken = localStorage.getItem('accessToken');
      
      if (!idToken || !accessToken) {
        throw new Error('No tokens found');
      }
      
      // Verify the token by calling the GetUser API
      const command = new GetUserCommand({
        AccessToken: accessToken
      });
      
      const response = await cognitoClient.send(command);
      
      if (response.Username) {
        const userAttributes = parseUserAttributes(response.UserAttributes || []);
        
        setAuthState({
          isAuthenticated: true,
          user: userAttributes,
          isLoading: false,
          error: null
        });
      } else {
        throw new Error('Invalid user data');
      }
    } catch (error) {
      // Clear tokens if they're invalid
      localStorage.removeItem('idToken');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null
      });
    }
  };

  const parseUserAttributes = (attributes: AttributeType[]): User => {
    const role = attributes.find(attr => attr.Name === 'custom:role')?.Value || 'student';
    const studentId = attributes.find(attr => attr.Name === 'custom:studentId')?.Value;
    const username = attributes.find(attr => attr.Name === 'preferred_username')?.Value || 
                    attributes.find(attr => attr.Name === 'email')?.Value || '';
    
    return {
      username,
      role: role as 'student' | 'staff',
      studentId
    };
  };

  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const command = new InitiateAuthCommand({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: USER_POOL_CLIENT_ID,
        AuthParameters: {
          USERNAME: email,
          PASSWORD: password
        }
      });
      
      const response = await cognitoClient.send(command);
      
      if (response.AuthenticationResult) {
        // Store tokens
        localStorage.setItem('idToken', response.AuthenticationResult.IdToken || '');
        localStorage.setItem('accessToken', response.AuthenticationResult.AccessToken || '');
        localStorage.setItem('refreshToken', response.AuthenticationResult.RefreshToken || '');
        
        // Get user attributes
        const getUserCommand = new GetUserCommand({
          AccessToken: response.AuthenticationResult.AccessToken
        });
        
        const userResponse = await cognitoClient.send(getUserCommand);
        const userAttributes = parseUserAttributes(userResponse.UserAttributes || []);
        
        setAuthState({
          isAuthenticated: true,
          user: userAttributes,
          isLoading: false,
          error: null
        });
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: (error as Error).message
      }));
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const accessToken = localStorage.getItem('accessToken');
      
      if (accessToken) {
        // Call global sign out
        const command = new GlobalSignOutCommand({
          AccessToken: accessToken
        });
        
        await cognitoClient.send(command);
      }
      
      // Clear tokens
      localStorage.removeItem('idToken');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null
      });
    } catch (error) {
      // Even if the API call fails, clear tokens and state
      localStorage.removeItem('idToken');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: (error as Error).message
      });
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      // Validate email domain
      if (!email.endsWith('@gatech.edu')) {
        throw new Error('Only @gatech.edu email addresses are allowed');
      }
      
      const userAttributes: AttributeType[] = [
        { Name: 'email', Value: email },
        { Name: 'custom:role', Value: 'student' }
      ];
      
      const command = new SignUpCommand({
        ClientId: USER_POOL_CLIENT_ID,
        Username: email,
        Password: password,
        UserAttributes: userAttributes
      });
      
      await cognitoClient.send(command);
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: (error as Error).message
      }));
      throw error;
    }
  };

  const confirmSignUp = async (email: string, code: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const command = new ConfirmSignUpCommand({
        ClientId: USER_POOL_CLIENT_ID,
        Username: email,
        ConfirmationCode: code
      });
      
      await cognitoClient.send(command);
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: (error as Error).message
      }));
      throw error;
    }
  };

  const value = {
    authState,
    viewAsStudent,
    toggleViewAsStudent,
    signIn,
    signOut,
    signUp,
    confirmSignUp
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
