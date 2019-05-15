exports.tokenParser = (content, clientId) => {
    const accessToken = content.access_token;

    const userId = accessToken.content.sub;

    let group = {};

    let role = {
        'X-Hasura-Realm-Role': (accessToken.content.realm_access.roles || []).join(','),
    };

    if (accessToken.content && Array.isArray(accessToken.content.group)) {
        group = parseGroup(accessToken.content.group);
    }

    const clientResource = accessToken.content.resource_access[clientId];

    if (
        accessToken.content &&
        accessToken.content.resource_access &&
        clientResource &&
        Array.isArray(clientResource.roles) &&
        clientResource.roles.length !== 0
    ) {
        role['X-Hasura-Role'] = clientResource.roles[0];
    } else {
        console.warn('Role not found in the token please verify the client ID is valid');
    }

    return {
        'X-Hasura-User-Id': userId,
        ...group,
        ...role,
    };
};

const parseGroup = exports.parseGroup = (group, defaultGroup) => {
    const parsedGroup = {
    };

    const rootGroups = group.map(res => res.split('/')[1])
        .filter((item, index, self) => self.indexOf(item) === index);

    if (rootGroups.length === 1) {
        parsedGroup['X-Hasura-Organization-Id'] = rootGroups[0];
    } else {
        if (typeof defaultGroup === 'number' && !isNaN(defaultGroup)) {
            parsedGroup['X-Hasura-Organization-Id'] = rootGroups[defaultGroup];
        } else {
            parsedGroup['X-Hasura-Organization-Id'] = rootGroups[0];
        }
    }

    return parsedGroup;
};
