export const queryUserQL = `query User($id: Int!){
    user(id: $id){
      id
      name
      email
      birthdate
      addresses {
        id
        cep
        street
        streetNumber
        complement
        neighborhood
        city
        state
      }
    }
  }`;

export const queryUsersQL = `query Users($input: Pagination){
    users(input: $input){
      total
      before
      after
      users {
        id
        name
        email
        birthdate
        addresses {
          id
          cep
          street
          streetNumber
          complement
          neighborhood
          city
          state
        }
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
