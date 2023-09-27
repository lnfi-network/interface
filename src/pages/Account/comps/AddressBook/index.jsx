import { Button, message, Input, Form, Modal, Spin, Popconfirm } from "antd";
import { useState, useCallback, useMemo, memo, useRef, useEffect } from "react";
import "./index.scss";
import { t } from "@lingui/macro";
import { useSelector } from "react-redux";
import { nip19 } from "nostr-tools";
import { DeleteOutlined } from "@ant-design/icons";
import { useAddressBook, useAddAddressBook } from "hooks/useNostrMarket";
const layout = {
  labelCol: {
    span: 5,
  },
  wrapperCol: {
    span: 19,
  },
};
function AddAddressBook({
  add,
  setAdd,
  addressBook,
  setAddressBook,
  handleQueryAddressBook,
}) {
  const [messageApi, contextHolder] = message.useMessage();
  const [btnLoading, setBtnLoading] = useState(false);
  const { handleAddAddress } = useAddAddressBook();
  const { nostrAccount } = useSelector(({ user }) => user);
  const onAddCancel = useCallback(() => {
    setAdd(false);
  }, [setAdd]);
  const [form] = Form.useForm();

  useEffect(() => {
    if (add) {
      form.resetFields();
    }
  }, [add, form]);
  const onAddAddressSubmit = useCallback(async () => {
    await form.validateFields();
    try {
      setBtnLoading(true);
      const values = form.getFieldsValue();
      const name = values.remark;
      const address = values.nostrAddress;
      let ret = await handleAddAddress({
        name,
        address,
      });

      if (ret?.code === 0) {
        message.success(t`Submit successfully`);
        setAdd(false);
        const queryRet = await handleQueryAddressBook();

        if (queryRet?.code == 0) {
          const retData = queryRet?.data || [];
          setAddressBook(retData);
        } else {
          setAddressBook([]);
        }
      } else {
        messageApi.open({
          type: "error",
          content: ret.data,
        });
      }
    } catch (e) {
      messageApi.error(e.message);
    } finally {
      setBtnLoading(false);
      //refresh balanceList
    }
  }, [
    form,
    handleAddAddress,
    handleQueryAddressBook,
    messageApi,
    setAdd,
    setAddressBook,
  ]);
  return (
    <>
      {contextHolder}
      <Modal
        className="add-address-modal"
        open={add}
        width="650px"
        title={t`Add Address`}
        footer={
          <>
            {" "}
            <Button
              type="primary"
              className={"add-address-submit-btn"}
              loading={btnLoading}
              onClick={onAddAddressSubmit}
            >
              {t`Save`}
            </Button>
          </>
        }
        onCancel={onAddCancel}
      >
        <Form
          className="add-address-form"
          {...layout}
          form={form}
          name="addAddressForm"
          autoComplete="off"
        >
          <Form.Item label={t`Nostr Address`}>
            <Form.Item
              name="nostrAddress"
              noStyle
              rules={[
                {
                  required: true,
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (value) {
                      if (value.indexOf("npub") == -1) {
                        return Promise.reject(
                          new Error(t`Invalid input format.`)
                        );
                      }
                      if (value == nip19.npubEncode(nostrAccount)) {
                        return Promise.reject(
                          new Error(t`You can't add to yourself.`)
                        );
                      }
                      if (
                        addressBook.some(
                          (item) => value == nip19.npubEncode(item.contacts)
                        )
                      ) {
                        return Promise.reject(
                          new Error(
                            t`The address already exists in your address book.`
                          )
                        );
                      }
                      return Promise.resolve();
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <Input type="text" />
            </Form.Item>
          </Form.Item>
          <Form.Item label={t`Remark`} className="amount-form-item">
            <Form.Item
              name="remark"
              noStyle
              rules={[
                {
                  required: true,
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (value) {
                      if (
                        addressBook.some((item) => value == item.description)
                      ) {
                        return Promise.reject(
                          new Error(
                            t`The name already exists in your address book. Please use a different label.`
                          )
                        );
                      }
                      return Promise.resolve();
                    }
                    return Promise.resolve();
                  },
                }),
              ]}
            >
              <Input type="text" placeholder="" maxLength={20} />
            </Form.Item>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
function AddressBook({ isAddressBookShow, setIsAddressBookShow }) {
  const [messageApi, contextHolder] = message.useMessage();
  const [add, setAdd] = useState(false);
  const [addressBook, setAddressBook] = useState([]);
  const { handleQueryAddressBook, fetching } = useAddressBook();
  const { handleRemoveAddress } = useAddAddressBook();

  const { nostrAccount } = useSelector(({ user }) => user);
  useEffect(() => {
    if (nostrAccount && isAddressBookShow) {
      const fetchData = async () => {
        const ret = await handleQueryAddressBook();
        if (ret?.code == 0) {
          const retData = ret?.data || [];
          setAddressBook(retData);
        } else {
          setAddressBook([]);
        }
      };
      fetchData().catch(console.error);
    }
    return () => null;
  }, [handleQueryAddressBook, isAddressBookShow, nostrAccount]);
  const onCancel = useCallback(() => {
    setIsAddressBookShow(false);
  }, [setIsAddressBookShow]);
  const deleteConfirm = useCallback(
    async (item) => {
      let ret = await handleRemoveAddress({
        name: item.description,
      });

      if (ret?.code === 0) {
        message.success(t`Submit successfully`);
        setAdd(false);
        const queryRet = await handleQueryAddressBook();

        if (queryRet?.code == 0) {
          const retData = queryRet?.data || [];
          setAddressBook(retData);
        } else {
          setAddressBook([]);
        }
      } else {
        messageApi.open({
          type: "error",
          content: ret.data,
        });
      }
    },
    [handleQueryAddressBook, handleRemoveAddress, messageApi]
  );
  const deleteCancel = (e) => {};

  const addressBookItems = useMemo(() => {
    if (addressBook?.length) {
      return addressBook?.map((item, i) => {
        const _address = nip19.npubEncode(item.contacts);
        return (
          <div className="address-items" key={item?.description}>
            <span className="b">
              {i + 1}. {item.description}:{" "}
              {_address.substring(0, 12) +
                "..." +
                _address.substring(_address.length - 8)}
            </span>
            <span className="address-delete">
              <Popconfirm
                title="Delete"
                description="Are you sure to delete this Address Book?"
                onConfirm={() => deleteConfirm(item)}
                onCancel={deleteCancel}
                okText="Yes"
                cancelText="No"
              >
                <DeleteOutlined></DeleteOutlined>
              </Popconfirm>
            </span>
          </div>
        );
      });
    } else {
      return (
        <div className="addressBook-empty">
          No contacts have been added to the address book yet.
        </div>
      );
    }
  }, [addressBook, deleteConfirm]);
  return (
    <>
      {contextHolder}

      <Modal
        className="addressBook-modal"
        open={isAddressBookShow}
        width="650px"
        title={t`My Address Book`}
        footer={null}
        /* onOk={handleOk} */
        onCancel={onCancel}
      >
        <div className="addressBook-content">
          {fetching ? (
            <>
              <Spin></Spin>
            </>
          ) : (
            addressBookItems
          )}
        </div>
        <div className="add-address-btn-box">
          <Button
            type="primary"
            className="add-address-btn"
            onClick={() => {
              setAdd(true);
            }}
          >{t`Add Address`}</Button>
        </div>
      </Modal>
      <AddAddressBook
        add={add}
        setAdd={setAdd}
        addressBook={addressBook}
        setAddressBook={setAddressBook}
        handleQueryAddressBook={handleQueryAddressBook}
      ></AddAddressBook>
    </>
  );
}
export default memo(AddressBook);
