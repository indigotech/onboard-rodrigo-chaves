export const queryUserQL = `query User($id: Int!){
    user(id: $id){
      id
      name
      email
      birthdate
    }
  }`;

export const queryUsersQL = `query Users($limit: Int, $offset: Int){
    users(limit: $limit, offset: $offset){
      total
      before
      after
      users {
        id
        name
        email
        birthdate
      }
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

export const mutationLoginQL = `mutation Login($input: LoginInput) {
            login(input: $input) {
              user {
                id
                name
                email
                birthdate
              },
              token
            }
          }`;
