import type { Access } from 'payload'

const isAdministrator: Access = ({ req }) => req.user?.role === 'admin'

export { isAdministrator }