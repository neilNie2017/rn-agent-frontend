import React, { useState } from 'react';
import { Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { AuthButton } from './AuthButton';
import { AuthLayout } from './AuthLayout';
import { FormTextInput } from './FormTextInput';
import type { RootStackParamList } from '../../navigation/types';
import { loginApi } from '../../request/auth';
import { setAuthToken } from '../../request/http';
import { saveCachedUser } from '../../storage/authStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

type LoginFormValues = {
  email: string;
  password: string;
};

function getLoginToken(response: Awaited<ReturnType<typeof loginApi>>) {
  return (
    response.data?.accessToken ??
    response.data?.token ??
    response.accessToken ??
    response.token ??
    ''
  );
}

function getLoginUser(response: Awaited<ReturnType<typeof loginApi>>) {
  return response.data?.user;
}

export function LoginScreen({ navigation }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<LoginFormValues>({
    defaultValues: {
      email: 'test@example.com',
      password: '123456',
    },
    mode: 'onChange',
  });

  async function handleLogin(values: LoginFormValues) {
    if (submitting) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await loginApi(values);
      const token = getLoginToken(response);

      if (token) {
        setAuthToken(token);
      }

      const user = getLoginUser(response);

      if (user) {
        await saveCachedUser(user);
      }

      navigation.replace('MainTabs');
    } catch (error) {
      const message =
        error instanceof Error ? error.message : '登录失败，请稍后重试。';
      Alert.alert('登录失败', message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout title="欢迎回来" subtitle="输入账号和密码继续使用应用">
      <FormTextInput
        autoCapitalize="none"
        autoCorrect={false}
        control={control}
        keyboardType="email-address"
        label="邮箱"
        name="email"
        placeholder="test@example.com"
        returnKeyType="next"
        rules={{
          required: '请输入邮箱',
          pattern: {
            value: /^\S+@\S+\.\S+$/,
            message: '请输入正确的邮箱',
          },
        }}
      />
      <FormTextInput
        control={control}
        label="密码"
        name="password"
        placeholder="至少 6 位密码"
        returnKeyType="done"
        rules={{
          required: '请输入密码',
          minLength: { value: 6, message: '密码至少 6 位' },
        }}
        secureTextEntry
      />
      <AuthButton
        disabled={!isValid || submitting}
        onPress={handleSubmit(handleLogin)}
        title={submitting ? '登录中...' : '登录'}
      />
      <AuthButton
        onPress={() => navigation.navigate('Register')}
        title="创建新账号"
        variant="ghost"
      />
    </AuthLayout>
  );
}
