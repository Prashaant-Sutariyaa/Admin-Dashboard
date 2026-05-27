import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from 'src/components/ui/dialog';
import { Input } from 'src/components/ui/input';
import { Label } from 'src/components/ui/label';
import { Button } from 'src/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { userService } from 'src/modules/users/services/userService';


interface Props {
  open: boolean;
  onClose: () => void;
  userId?: number;
}

const ChangePasswordDialog = ({ open, onClose, userId }: Props) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [show, setShow] = useState(false);

  const regex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;

  const handleSubmit = async () => {
    if (!regex.test(password)) {
      toast.error('Min 6 chars, include number');
      return;
    }

    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }

    await userService.patchUser(userId!, {
      password,
    });

    toast.success('Password updated');
    onClose();
  };

  useEffect(() => {
  if (!open) {
    setPassword('');
    setConfirm('');
    setShow(false);
  }
}, [open]);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>New Password</Label>
            <div className="flex gap-2">
              <Input
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <Button variant="outline" onClick={() => setShow(!show)}>
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </Button>
            </div>
          </div>

          <div>
            <Label>Confirm Password</Label>
            <Input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <div className="flex justify-end">
            <Button variant="lightprimary" onClick={handleSubmit}>Update</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;