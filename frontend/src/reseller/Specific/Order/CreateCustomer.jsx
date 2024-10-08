import React, { useState } from 'react';
import { Button, Upload, Modal, Tooltip, message, Spin } from 'antd';
import { UploadOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { addCustomer } from '../../Redux/ordersSlice';
import AddOrders from './AddOrders';
import { uploadFile } from '../../Api/PostApi';

const CreateCustomer = ({ open, onOk, onCancel, title }) => {
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [customerId, setCustomerId] = useState('');
  const [loading, setLoading] = useState(false); // Add loading state
  const { register, handleSubmit, formState: { errors }, setError, clearErrors, reset } = useForm();
  const dispatch = useDispatch();

  const beforeUpload = (file) => {
    const isPDF = file.type === 'application/pdf';
    if (!isPDF) {
      message.error('You can only upload PDF files!');
    }
    return isPDF || Upload.LIST_IGNORE;
  };

  const handleFileChange = async (info) => {
    setFileError('');
    const fileList = info.fileList;

    if (fileList.length > 0) {
      const uploadedFile = fileList[0].originFileObj;

      if (info.file) {
        try {
          setLoading(true); // Start loading when file upload begins
          const formData = new FormData();
          formData.append('file', uploadedFile);
          formData.append('upload_preset', 'your_upload_preset'); // For Cloudinary or similar

         const response=  await uploadFile(formData)

          
          console.log(response.data.url);
          
          setFile(response.data.url); // Store the file URL after upload
          clearErrors('file');
          setLoading(false); // Stop loading after file upload is done
        } catch (error) {
          setFileError('Error uploading file');
          setLoading(false);
        }
      } else if (info.file.status === 'removed') {
        setFile(null);
        setError('file', {
          type: 'manual',
          message: 'Please upload a file',
        });
      }
    }
  };

  const onSubmit = (data) => {
    if (!file) {
      setFileError('Please upload a file');
      setError('file', {
        type: 'manual',
        message: 'Please upload a file',
      });
      return;
    }

    const uniqueId = uuidv4(); // Generate a unique ID

    const customer = {
      _id: uniqueId,
      customerName: data.customerName,
      label: file, // File URL from Cloudinary
    };

    dispatch(addCustomer(customer));
    setCustomerId(uniqueId);
    setSubmitted(true);
    reset();
  };

  const handleFooterClick = () => {
    onCancel(); // Close the modal
    setSubmitted(false); // Reset submission state
  };

  return (
    <Modal
      width={700}
      title={title}
      open={open}
      onCancel={onCancel}
      footer={
        submitted ? (
          <Button type="primary" onClick={handleFooterClick}>
            Submit
          </Button>
        ) : null
      }
      bodyStyle={{ maxHeight: '500px', overflowY: 'auto' }} // Ensure scrolling for long content
    >
      <div className="flex flex-col gap-4 p-0">
        {!submitted ? (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-semibold">
                Customer Name
                <Tooltip title="Please enter the full name of the customer.">
                  <InfoCircleOutlined className="ml-2 text-gray-400" />
                </Tooltip>
              </label>
              <input
                className="p-2 border-2 rounded-lg border-blue-400 focus:border-blue-500"
                {...register('customerName', { required: 'Customer name is required' })}
                placeholder="e.g., John Doe"
              />
              {errors.customerName && (
                <span className="text-red-500">{errors.customerName.message}</span>
              )}
            </div>

            <div className="flex items-center gap-4">
              <label className="font-semibold">
                Upload Label
                <Tooltip title="Upload the relevant file or document.">
                  <InfoCircleOutlined className="ml-2 text-gray-400" />
                </Tooltip>
              </label>
              <Upload
                onChange={handleFileChange}
                beforeUpload={beforeUpload}
                maxCount={1}
                showUploadList={false} // Disable file list display
              >
                <Button icon={<UploadOutlined />} disabled={loading}>
                  {loading ? <Spin /> : 'Select Label'}
                </Button>
              </Upload>
              {fileError && <span className="text-red-500">{fileError}</span>}
            </div>

            <div className="flex justify-end">
              <Tooltip title="Ensure all fields are filled correctly before uploading.">
                <Button type="primary" htmlType="submit" disabled={loading}>
                  Add
                </Button>
              </Tooltip>
            </div>
          </form>
        ) : (
          <AddOrders customerId={customerId} />
        )}
      </div>
    </Modal>
  );
};

export default CreateCustomer;
