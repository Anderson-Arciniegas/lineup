export const businessSelection = `{
    id
    name
    path
    description
    email
    emailValidated
    image {
        directory
        extension
        name
        url
        idCreationUser
        creationDate
        creationUser {
        id
        username
        email
        firstName
        lastName
        provider
        status
        emailValidated
        }
    }
    imageCode
    telephone
    provider
    status
    tags
    locations {
        id
        address
        addressComponents
        business {
        id
        name
        path
        description
        email
        emailValidated
        image { directory extension name url }
        imageCode
        telephone
        provider
        status
        tags
        }
        idCreationBusiness
        modificationBusiness {
        id
        name
        path
        description
        email
        emailValidated
        image { directory extension name url }
        imageCode
        telephone
        provider
        status
        tags
        }
        status
    }
    products {
        id
        title
        subtitle
        description
        price
        likes
        tags
        status
        idCatalog
        idCreationBusiness
        business {
        id
        name
        path
        description
        email
        emailValidated
        image { directory extension name url }
        imageCode
        telephone
        provider
        status
        tags
        }
        catalog { id title }
    }
    catalogs {
        id
        idCreationBusiness
        title
        status
        products {
        id
        title
        subtitle
        description
        price
        likes
        tags
        status
        idCatalog
        idCreationBusiness
        business {
            id
            name
            path
            description
            email
            emailValidated
            image { directory extension name url }
            imageCode
            telephone
            provider
            status
            tags
        }
        catalog { id title }
        }
        modificationBusiness {
        id
        name
        path
        description
        email
        emailValidated
        image { directory extension name url }
        imageCode
        telephone
        provider
        status
        tags
        }
    }
    businessRoles {
        business {
        id
        name
        path
        description
        email
        emailValidated
        image { directory extension name url idCreationUser }
        imageCode
        telephone
        provider
        status
        tags
        }
        creationCoordinate { latitude longitude }
        creationDate
        creationIp
        idCreationBusiness
        idRole
        modificationCoordinate { latitude longitude }
        modificationDate
        modificationIp
        role {
        id
        code
        description
        idCreationUser
        status
        rolePermissions {
            idCreationUser
            idPermission
            idRole
            permission { id code description }
            creationUser {
            id
            username
            email
            firstName
            lastName
            provider
            status
            emailValidated
            }
            modificationUser {
            id
            username
            email
            firstName
            lastName
            provider
            status
            emailValidated
            }
        }
        }
        status
    }
}`;