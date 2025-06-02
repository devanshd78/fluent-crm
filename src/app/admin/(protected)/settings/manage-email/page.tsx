"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { post } from "@/lib/api";
import Swal from "sweetalert2";

// Shape returned by API
interface ApiItem {
  _id: string;
  user: string;
  host: string;
  port: number;
  secure: boolean;
  createdAt: string;
}

interface SmtpConfig {
  id?: string;
  host: string;
  user: string;
  pass: string;
  port: string;
  secure: boolean;
}

export default function Page() {
  const [smtp, setSmtp] = useState<SmtpConfig>({
    host: "",
    user: "",
    pass: "",
    port: "",
    secure: false,
  });
  const [records, setRecords] = useState<SmtpConfig[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      const response = await post<{ status: string; data: { items: ApiItem[] } }>(
        "/smtp/getCredentialsList"
      );
      const items = response.data.items || [];
      const configs: SmtpConfig[] = items.map(item => ({
        id: item._id,
        user: item.user,
        host: item.host,
        pass: "",
        port: item.port.toString(),
        secure: item.secure,
      }));
      setRecords(configs);
    } catch (err) {
      console.error("Failed to fetch list", err);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Failed to load records',
        showConfirmButton: false,
        timer: 3000,
      });
    }
  };

  const handleChange = (
    key: keyof SmtpConfig,
    value: string | boolean
  ) => setSmtp(prev => ({ ...prev, [key]: value }));

  const validate = (): boolean => {
    if (!smtp.host.trim()) {
      Swal.fire({ toast:true, position:'top-end', icon:'error', title:'Host is required', showConfirmButton:false, timer:3000 });
      return false;
    }
    if (!smtp.user.trim()) {
      Swal.fire({ toast:true, position:'top-end', icon:'error', title:'User is required', showConfirmButton:false, timer:3000 });
      return false;
    }
    if (!smtp.pass.trim() && !isEditing) {
      Swal.fire({ toast:true, position:'top-end', icon:'error', title:'Password is required', showConfirmButton:false, timer:3000 });
      return false;
    }
    if (!smtp.port.trim()) {
      Swal.fire({ toast:true, position:'top-end', icon:'error', title:'Port is required', showConfirmButton:false, timer:3000 });
      return false;
    }
    if (isNaN(Number(smtp.port))) {
      Swal.fire({ toast:true, position:'top-end', icon:'error', title:'Port must be a number', showConfirmButton:false, timer:3000 });
      return false;
    }
    return true;
  };

  const saveRecord = async () => {
    if (!validate()) return;
    try {
      await post("/smtp/smtpcredentials", smtp);
      resetForm();
      fetchList();
      Swal.fire({ toast:true, position:'top-end', icon:'success', title:'Record saved', showConfirmButton:false, timer:3000 });
    } catch (err) {
      console.error("Save failed", err);
      Swal.fire({ toast:true, position:'top-end', icon:'error', title:'Save failed', showConfirmButton:false, timer:3000 });
    }
  };

  const updateRecord = async () => {
    if (!smtp.id) return;
    if (!validate()) return;
    try {
      await post("/smtp/updateCredentials", smtp);
      resetForm();
      fetchList();
      Swal.fire({ toast:true, position:'top-end', icon:'success', title:'Record updated', showConfirmButton:false, timer:3000 });
    } catch (err) {
      console.error("Update failed", err);
      Swal.fire({ toast:true, position:'top-end', icon:'error', title:'Update failed', showConfirmButton:false, timer:3000 });
    }
  };

  const deleteRecord = async (id?: string) => {
    if (!id) return;
    const result = await Swal.fire({
      title: 'Delete this record? (Cannot be undone)',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    });
    if (result.isConfirmed) {
      try {
        await post("/smtp/deleteCredentials", { id });
        fetchList();
        Swal.fire({ toast:true, position:'top-end', icon:'success', title:'Record deleted', showConfirmButton:false, timer:3000 });
      } catch (err) {
        console.error("Delete failed", err);
        Swal.fire({ toast:true, position:'top-end', icon:'error', title:'Delete failed', showConfirmButton:false, timer:3000 });
      }
    }
  };

  const editRecord = (rec: SmtpConfig) => {
    setSmtp(rec);
    setIsEditing(true);
  };

  const resetForm = () => {
    setSmtp({ host: "", user: "", pass: "", port: "", secure: false });
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-white p-6 shadow-md rounded-lg">
      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {isEditing ? 'Update Record' : 'New Record'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Host</span>
              <Input
                placeholder="smtp.example.com"
                value={smtp.host}
                onChange={e => handleChange('host', e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">User</span>
              <Input
                placeholder="user@example.com"
                value={smtp.user}
                onChange={e => handleChange('user', e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Password</span>
              <Input
                type="password"
                placeholder={isEditing ? '••••••••' : '********'}
                value={smtp.pass}
                onChange={e => handleChange('pass', e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Port</span>
              <Input
                type="number"
                placeholder="465"
                value={smtp.port}
                onChange={e => handleChange('port', e.target.value)}
              />
            </label>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="secure"
                checked={smtp.secure}
                onCheckedChange={checked => handleChange('secure', Boolean(checked))}
              />
              <span className="text-sm">Use SSL/TLS</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button onClick={updateRecord}>Update</Button>
            </>
          ) : (
            <Button onClick={saveRecord}>Save Settings</Button>
          )}
        </CardFooter>
      </Card>

      {/* Records Table Card */}
      {records.length > 0 && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Saved SMTP Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Host</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Password</TableHead>
                    <TableHead>Port</TableHead>
                    <TableHead>Secure</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map(rec => (
                    <TableRow key={rec.id}>
                      <TableCell>{rec.host}</TableCell>
                      <TableCell>{rec.user}</TableCell>
                      <TableCell>••••••••</TableCell>
                      <TableCell>{rec.port}</TableCell>
                      <TableCell>{rec.secure ? 'Yes' : 'No'}</TableCell>
                      <TableCell className="space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => editRecord(rec)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteRecord(rec.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
