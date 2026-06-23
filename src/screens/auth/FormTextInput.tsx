import React from 'react';
import {
  Control,
  Controller,
  FieldValues,
  Path,
  RegisterOptions,
} from 'react-hook-form';
import { StyleSheet, Text, TextInputProps, View } from 'react-native';
import { AuthTextInput } from './AuthTextInput';

type FormTextInputProps<T extends FieldValues> = TextInputProps & {
  control: Control<T>;
  label: string;
  name: Path<T>;
  rules?: RegisterOptions<T, Path<T>>;
};

export function FormTextInput<T extends FieldValues>({
  control,
  label,
  name,
  rules,
  ...props
}: FormTextInputProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field: { onBlur, onChange, value }, fieldState }) => (
        <View style={styles.field}>
          <AuthTextInput
            label={label}
            onBlur={onBlur}
            onChangeText={onChange}
            value={typeof value === 'string' ? value : ''}
            {...props}
          />
          {fieldState.error?.message ? (
            <Text style={styles.error}>{fieldState.error.message}</Text>
          ) : null}
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  field: {
    gap: 6,
  },
  error: {
    color: '#dc2626',
    fontSize: 13,
    lineHeight: 18,
  },
});
