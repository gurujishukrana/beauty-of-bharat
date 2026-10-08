'use client'

import { Button, FieldLabel, useField, useFormModified } from '@payloadcms/ui'
import type { SelectFieldClientComponent } from 'payload'

/**
 * "Submit for review" for reporters (and anyone else): marks the draft ready for an editor.
 * Editors filter the article list by "Review status = Ready for review".
 */
export const ReviewStatusField: SelectFieldClientComponent = ({ path }) => {
  const { value, setValue } = useField<string>({ path })
  const modified = useFormModified()
  const ready = value === 'ready'

  return (
    <div className="field-type" style={{ marginBottom: 24 }}>
      <FieldLabel label="Review status" path={path} />
      <p style={{ margin: '4px 0 10px', fontSize: 13 }}>
        {ready ? 'Ready for an editor to review.' : 'In progress.'}
      </p>
      {ready ? (
        <Button buttonStyle="secondary" size="small" onClick={() => setValue('in-progress')}>
          Withdraw from review
        </Button>
      ) : (
        <Button buttonStyle="primary" size="small" onClick={() => setValue('ready')}>
          Submit for review
        </Button>
      )}
      {modified && (
        <p style={{ margin: '8px 0 0', fontSize: 12, opacity: 0.75 }}>
          Remember to save the draft so editors see the change.
        </p>
      )}
    </div>
  )
}
