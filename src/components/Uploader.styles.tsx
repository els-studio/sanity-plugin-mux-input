import {useId} from '@reach/auto-id'
import {Box, Button, Card, Dialog, Flex, Grid, Stack, Text} from '@sanity/ui'
import cx from 'classnames'
import FormField from 'part:@sanity/components/formfields/default'
import ProgressBar from 'part:@sanity/components/progress/bar'
import React, {forwardRef, useCallback, useRef} from 'react'
import {FiCopy, FiUpload} from 'react-icons/fi'
import styled from 'styled-components'

import {FileInputButton, FileInputButtonProps} from './FileInputButton'
import styles from './UploadPlaceholder.css'

interface ErrorDialogProps {
  message: string
  onClose: () => void
  onSetup: () => void
}
export const ErrorDialog = ({message, onClose, onSetup}: ErrorDialogProps) => {
  const id = `ErrorDialog${useId()}`
  if (message === 'Invalid credentials') {
    return (
      <Dialog id={id} header="Invalid credentials" onClose={onClose}>
        <Box padding={4}>
          <Stack space={4}>
            <Text>You need to check your Mux access token and secret key.</Text>
            <Button text="Run setup" tone="primary" padding={3} onClick={onSetup} />
          </Stack>
        </Box>
      </Dialog>
    )
  }
  return (
    <Dialog id={id} header="Upload failed" onClose={onClose}>
      <Box padding={4}>
        <Text>{message}</Text>
      </Box>
    </Dialog>
  )
}

interface UploadProgressProps {
  progress: number
  error?: Error | null
  fileInfo?: {name?: string} | null
  url?: string | null
  onCancel: React.MouseEventHandler<HTMLButtonElement>
}
export const UploadProgress = ({
  progress: uploadProgress,
  fileInfo,
  url,
  error,
  onCancel,
}: UploadProgressProps) => {
  let text =
    uploadProgress < 100
      ? `Uploading ${fileInfo ? `'${fileInfo.name}'` : 'file'}`
      : 'Waiting for Mux to complete the file'
  if (error) {
    text = error.message
  }
  if (url) {
    text = `Uploading ${url}`
  }
  return (
    <UploadProgressCard padding={4}>
      <UploadProgressStack space={5}>
        <ProgressBar
          percent={uploadProgress}
          text={text}
          isInProgress={uploadProgress === 100 && !error}
          showPercent
          animation
          color="primary"
        />
        {(uploadProgress < 100 || error) && (
          <UploadCancelButton text="Cancel upload" padding={3} tone="critical" onClick={onCancel} />
        )}
      </UploadProgressStack>
    </UploadProgressCard>
  )
}
const UploadProgressCard = styled(Card)`
  box-sizing: border-box;
`
const UploadCancelButton = styled(Button)`
  justify-self: center;
`
const UploadProgressStack = styled(Stack)`
  text-align: left;
`

const ctrlKey = 17
const cmdKey = 91

interface UploadCardProps {
  children: React.ReactNode
  onPaste: React.ClipboardEventHandler<HTMLInputElement>
  onFocus: React.FocusEventHandler<HTMLDivElement>
  onBlur: React.FocusEventHandler<HTMLDivElement>
  onDrop: React.DragEventHandler<HTMLDivElement>
  onDragOver: React.DragEventHandler<HTMLDivElement>
  onDragLeave: React.DragEventHandler<HTMLDivElement>
  onDragEnter: React.DragEventHandler<HTMLDivElement>
}
export const UploadCard = forwardRef<HTMLDivElement, UploadCardProps>(
  (
    {children, onPaste, onFocus, onBlur, onDrop, onDragEnter, onDragLeave, onDragOver},
    forwardedRef
  ) => {
    const ctrlDown = useRef(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const handleKeyDown = useCallback<React.KeyboardEventHandler<HTMLDivElement>>((event) => {
      if (event.keyCode == ctrlKey || event.keyCode == cmdKey) {
        ctrlDown.current = true
      }
      const vKey = 86
      if (ctrlDown.current && event.keyCode == vKey) {
        inputRef.current!.focus()
      }
    }, [])
    const handleKeyUp = useCallback<React.KeyboardEventHandler<HTMLDivElement>>((event) => {
      if (event.keyCode == ctrlKey || event.keyCode == cmdKey) {
        ctrlDown.current = false
      }
    }, [])

    return (
      <Card
        ref={forwardedRef}
        padding={0}
        radius={0}
        shadow={0}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onPaste={onPaste}
        onFocus={onFocus}
        onBlur={onBlur}
        onDrop={onDrop}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
      >
        <HiddenInput ref={inputRef} onPaste={onPaste} />
        {children}
      </Card>
    )
  }
)

const HiddenInput = styled.input.attrs({type: 'text'})`
  position: absolute;
  border: 0;
  color: white;
  opacity: 0;

  &:focus {
    outline: none;
  }
`

interface UploadPlaceholderProps {
  onUpload: (files: FileList) => void
  onBrowse: () => void
  invalidPaste: boolean
  invalidFile: boolean
  hasFocus: boolean
  isDraggingOver: boolean
}
export const UploadPlaceholder = ({
  onUpload,
  onBrowse,
  invalidPaste,
  invalidFile,
  hasFocus,
  isDraggingOver,
}: UploadPlaceholderProps) => {
  const fileClassNames = [styles.dropFile]
  const pasteClassNames = [styles.pasteFile]
  if (invalidFile) {
    fileClassNames.push(styles.invalidFile)
  }
  if (isDraggingOver) {
    fileClassNames.push(styles.isDraggingOver)
  }
  if (invalidPaste) {
    pasteClassNames.push(styles.invalidPaste)
  }
  if (hasFocus) {
    pasteClassNames.push(styles.hasFocus)
  }
  return (
    <div>
      <FormField level={0}>
        <div>
          <Flex justify="center" align="center" padding={3}>
            <div className={cx(fileClassNames)}>
              <div className={styles.iconContainer}>
                <FiUpload size="0.5em" />
              </div>
              <p className={styles.strong}>
                <span>Drop file {invalidFile}</span>
              </p>
            </div>
            <div className={pasteClassNames.join(' ')}>
              <div className={styles.iconContainer}>
                <FiCopy {...(invalidPaste ? {color: 'red'} : {})} size="0.5em" />
              </div>
              <div>
                <p className={styles.strong}>
                  <span>Paste URL</span>
                </p>
              </div>
            </div>
          </Flex>
        </div>
      </FormField>
      <Grid columns={2} gap={2}>
        <UploadButton onSelect={onUpload} />
        <Button mode="ghost" tone="default" text="Browse" onClick={onBrowse} />
      </Grid>
    </div>
  )
}

interface UploadButtonProps extends Pick<FileInputButtonProps, 'onSelect'> {}
export const UploadButton = ({onSelect}: UploadButtonProps) => {
  return (
    <FileInputButton
      icon={<FiUpload data-sanity-icon="upload" />}
      onSelect={onSelect}
      text="Upload"
    />
  )
}

interface UploadButtonGridProps {
  children: React.ReactNode
  onUpload: FileInputButtonProps['onSelect']
}
export const UploadButtonGrid = ({children, onUpload}: UploadButtonGridProps) => {
  return (
    <Grid columns={4} gap={2}>
      <UploadButton onSelect={onUpload} />
      {children}
    </Grid>
  )
}
