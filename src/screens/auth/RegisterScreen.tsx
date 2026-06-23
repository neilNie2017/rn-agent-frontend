import React from 'react';
import { Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useForm } from 'react-hook-form';
import { AuthButton } from './AuthButton';
import { AuthLayout } from './AuthLayout';
import { FormTextInput } from './FormTextInput';
import type { RootStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

type RegisterFormValues = {
  account: string;
  password: string;
  confirmPassword: string;
};

export function RegisterScreen({ navigation }: Props) {
  const {
    control,
    getValues,
    handleSubmit,
    formState: { isValid },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      account: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  function handleRegister() {
    Alert.alert('注册成功', '当前为前端模拟注册，请返回登录。', [
      { text: '去登录', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <AuthLayout title="创建账号" subtitle="先完成前端注册流程，接口后续接入">
      <FormTextInput
        autoCapitalize="none"
        autoCorrect={false}
        control={control}
        keyboardType="email-address"
        label="账号"
        name="account"
        placeholder="邮箱或手机号"
        rules={{ required: '请输入账号' }}
      />
      <FormTextInput
        control={control}
        label="密码"
        name="password"
        placeholder="至少 6 位密码"
        rules={{
          required: '请输入密码',
          minLength: { value: 6, message: '密码至少 6 位' },
        }}
        secureTextEntry
      />
      <FormTextInput
        control={control}
        label="确认密码"
        name="confirmPassword"
        placeholder="再次输入密码"
        rules={{
          required: '请再次输入密码',
          validate: value =>
            value === getValues('password') || '两次输入的密码不一致',
        }}
        secureTextEntry
      />
      <AuthButton
        disabled={!isValid}
        onPress={handleSubmit(handleRegister)}
        title="注册"
      />
      <AuthButton
        onPress={() => navigation.goBack()}
        title="已有账号，去登录"
        variant="ghost"
      />
    </AuthLayout>
  );
}
