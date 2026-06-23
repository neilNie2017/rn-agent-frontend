import React from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { AuthButton } from './AuthButton';
import { AuthLayout } from './AuthLayout';
import { FormTextInput } from './FormTextInput';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

type LoginFormValues = {
  account: string;
  password: string;
};

export function LoginScreen({ navigation }: Props) {
  const {
    control,
    handleSubmit,
    formState: { isValid },
  } = useForm<LoginFormValues>({
    defaultValues: {
      account: '',
      password: '',
    },
    mode: 'onChange',
  });

  function handleLogin() {
    navigation.replace('MainTabs', { screen: 'Home' });
  }

  return (
    <AuthLayout title="欢迎回来" subtitle="输入账号和密码继续使用应用">
      <FormTextInput
        autoCapitalize="none"
        autoCorrect={false}
        control={control}
        keyboardType="email-address"
        label="账号"
        name="account"
        placeholder="邮箱或手机号"
        returnKeyType="next"
        rules={{ required: '请输入账号' }}
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
        disabled={!isValid}
        onPress={handleSubmit(handleLogin)}
        title="登录"
      />
      <AuthButton
        onPress={() => navigation.navigate('Register')}
        title="创建新账号"
        variant="ghost"
      />
    </AuthLayout>
  );
}
