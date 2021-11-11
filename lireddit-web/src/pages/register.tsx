import { Box, Button } from '@chakra-ui/react';
import { Form, Formik } from 'formik';
import React from 'react';
import InputField from '../components/InputField';
import Wrapper from '../components/Wrapper';
import { useRegisterMutation } from '../generated/graphql';
import { toErrorMap } from '../utils/toErroMap';

interface registerProps {

}

const Register: React.FC<registerProps> = ({ }) => {
  const [, register] = useRegisterMutation();
  return (
    <Wrapper variant='small'>
      <Formik
        initialValues={{ username: '', password: '' }}
        onSubmit={async (values, { setErrors }) => {
          const response = await register(values);
          if (response.data?.register.errors) {
            setErrors(toErrorMap(response.data.register.errors))
          }
        }}>
        {
          ({ isSubmitting }) => (
            <Form>
              <InputField name={'username'} label={'Username'} placeholder={'username'}></InputField>
              <Box mt={4}>
                <InputField name={'password'} label={'Password'} placeholder={'password'} type={'password'}></InputField>
              </Box>
              <Button mt={4} type="submit" colorScheme="teal" isLoading={isSubmitting}>register</Button>

            </Form>
          )
        }
      </Formik>
    </Wrapper>

  )
}

export default Register;