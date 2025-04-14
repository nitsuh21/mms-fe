export interface SignUpData {
    email: string;
    password: string;
    confirm_password: string;
    first_name: string;
    last_name: string;
}

export interface SignInData {
    email: string;
    password: string;
}

export interface AuthResponse {
    access: string;
    refresh: string;
    user: UserData;
}

export interface UserData {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: 'PA' | 'TA' | 'TS' | 'CU';  // Platform Admin, Tenant Admin, Tenant Staff, Customer
}

export interface PasswordResetRequest {
    email: string;
}

export interface PasswordResetConfirm {
    password: string;
    confirm_password: string;
}

export interface TokenRefreshRequest {
    refresh: string;
}

export interface TokenRefreshResponse {
    access: string;
}
