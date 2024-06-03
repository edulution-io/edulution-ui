import { DialogContentSH, DialogSH, DialogTitleSH } from '@/components/ui/DialogSH.tsx';
import React, { FC } from 'react';
import { ScrollArea } from '@/components/ui/ScrollArea.tsx';
import { AccordionContent, AccordionItem, AccordionSH, AccordionTrigger } from '@/components/ui/AccordionSH.tsx';
import AddStudentsDialogBody from '@/pages/SchoolmanagementPage/components/dialogs/AddStudentsDialogBody.tsx';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

interface GeneralDialogProps {
  title: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onOpenChange: (isOpen: boolean) => void;
  properties?: Array<{ label: string; value: string | boolean }>;
  admins?: Array<{ name: string; role: string }>;
  members?: Array<{ name: string; role: string }>;
  printers?: Array<{ name: string; role: string }>;
  showMemberAdd?: boolean;
  showAdminsSection?: boolean;
  showMembersSection?: boolean;
  showPrintersSection?: boolean;
  showPropertiesSection?: boolean;
}

const EnrolDialog: FC<GeneralDialogProps> = ({
  title,
  isOpen,
  setIsOpen,
  onOpenChange,
  properties = [],
  admins = [],
  members = [],
  printers = [],
  showAdminsSection = true,
  showMembersSection = true,
  showPrintersSection = true,
  showMemberAdd = false,
  showPropertiesSection = true,
}) => {
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (onOpenChange) {
      handleFormSubmit();
      onOpenChange(open);
    }
  };

  const initialFormValues = {
    invitedAttendees: [],
    invitedGroups: [],
  };

  const formSchema = z.object({
    invitedAttendees: z.array(
      z.intersection(
        z.object({
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          username: z.string(),
        }),
        z.object({
          value: z.string(),
          label: z.string(),
        }),
      ),
    ),
    invitedGroups: z.array(z.object({})),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    mode: 'onChange',
    resolver: zodResolver(formSchema),
    defaultValues: initialFormValues,
  });

  const onSubmit = async () => {
    form.reset();
    handleOpenChange(false);
  };

  const handleFormSubmit = form.handleSubmit(onSubmit);

  return (
    <DialogSH
      open={isOpen}
      onOpenChange={handleOpenChange}
    >
      <ScrollArea className="max-h-[80vh] overflow-auto">
        <DialogContentSH className="text-black">
          <DialogTitleSH>{title}</DialogTitleSH>
          <div className="p-4">
            {showPropertiesSection && properties.length > 0 && (
              <div className="mb-4">
                <h3 className="mb-2 text-lg font-semibold">Eigenschaften</h3>
                <table className="w-full table-auto">
                  <tbody>
                    {properties.map((prop, index) => (
                      <tr key={index}>
                        <td className="border px-4 py-2">{prop.label}</td>
                        <td className="border px-4 py-2">
                          {typeof prop.value === 'boolean' ? (
                            <input
                              type="checkbox"
                              checked={prop.value}
                              readOnly
                            />
                          ) : (
                            prop.value
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {showPrintersSection && (
              <div className="mb-4">
                <h3 className="mb-2 text-lg font-semibold">Devices</h3>
                {printers.map((admin, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded border p-2"
                  >
                    <p>{admin.name}</p>
                    <p>{admin.role}</p>
                  </div>
                ))}
              </div>
            )}
            {showAdminsSection && (
              <div className="mb-4">
                <h3 className="mb-2 text-lg font-semibold">Gruppenadministratoren</h3>
                {admins.map((admin, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded border p-2"
                  >
                    <p>{admin.name}</p>
                    <p>{admin.role}</p>
                  </div>
                ))}
              </div>
            )}
            {showMembersSection && (
              <div className="mb-4">
                <h3 className="mb-2 text-lg font-semibold">Gruppenmitglieder</h3>
                {members.map((member, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded border p-2"
                  >
                    <p>{member.name}</p>
                    <p>{member.role}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          {showMemberAdd && (
            <AccordionSH type="multiple">
              <AccordionItem value="addUser">
                <AccordionTrigger className="w-full text-xl font-bold">Nutzer hinzufügen</AccordionTrigger>
                <AccordionContent className="h-[20vh] overflow-auto">
                  <AddStudentsDialogBody form={form} />
                </AccordionContent>
              </AccordionItem>
            </AccordionSH>
          )}

          <div className="mt-4 flex justify-between">
            <button
              className="rounded bg-red-500 px-4 py-2 text-white"
              onClick={() => handleOpenChange(false)}
            >
              Löschen
            </button>
            <button
              className="rounded bg-green-500 px-4 py-2 text-white"
              onClick={() => handleOpenChange(false)}
            >
              Speichern
            </button>
          </div>
        </DialogContentSH>
      </ScrollArea>
    </DialogSH>
  );
};

export default EnrolDialog;
