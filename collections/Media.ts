import { isAdministrator } from '@/lib/access'
import { APIError, type CollectionConfig } from 'payload'

const imageMimeTypes = ['image/png', 'image/jpeg', 'image/webp']
const maxPhotoSize = 10 * 1024 * 1024

export const Media: CollectionConfig = {
  slug: 'media',
  admin: {
    useAsTitle: 'filename',
  },
  access: {
    read: () => true,
    create: isAdministrator,
    update: isAdministrator,
    delete: isAdministrator,
  },
  upload: {
    mimeTypes: imageMimeTypes,
  },
  hooks: {
    beforeOperation: [
      ({ args, operation }) => {
        if (operation !== 'create' && operation !== 'update') return args
        const file = args.req.file
        if (!file) return args
        if (!imageMimeTypes.includes(file.mimetype)) {
          throw new APIError('Unsupported image type. Upload a PNG, JPEG, or WebP image.', 400)
        }
        if (file.size > maxPhotoSize) {
          throw new APIError('Image is too large. Upload an image of 10 MB or less.', 413)
        }
        return args
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'description',
      type: 'textarea',
      required: false,
    }
  ],
}
