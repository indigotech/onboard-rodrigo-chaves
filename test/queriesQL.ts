export const queryUserQL = `query User{
    users{
      id
      name
      email
      birthdate
    }
  }`;

export const mutationCreateUserQL = `mutation CreateUser($input: UserInput){
                createUser(input: $input) {
                  id
                  name
                  email
                  birthdate
                }
              }`;

export const mutationLoginQL = `mutation Login($email: String!, $password: String!) {
            login(email: $email, password: $password) {
              user {
                id
                name
                email
                birthdate
              },
              token
            }
          }`;
