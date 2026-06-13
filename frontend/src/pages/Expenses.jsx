import { useParams, Link } from 'react-router-dom';
import { IndianRupee, PieChart, Plus, ArrowRightLeft, Trash2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import useUserStore from '../store/userStore';

const Expenses = () => {
  const { id } = useParams();
  const [expenses, setExpenses] = useState([]);
  const [splits, setSplits] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDesc, setNewDesc] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newPayer, setNewPayer] = useState('Me');

  const [groupMembers, setGroupMembers] = useState([]);
  const user = useUserStore(state => state.user);

  const fetchExpenses = async () => {
    try {
      const res = await axios.get(`/expenses/${id}`);
      if (res.data) {
        setExpenses(res.data.expenses);
        setSplits(res.data.settlements);
      }
      
      // Also fetch members to populate the dropdown
      const itinRes = await axios.get(`/itineraries/${id}`);
      if (itinRes.data && itinRes.data.groupMembers) {
        setGroupMembers(itinRes.data.groupMembers);
        // Default payer to current user if available
        if (user) setNewPayer(user._id);
      }
    } catch (error) {
      console.error('Failed to fetch expenses', error);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [id, user]);

  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!newDesc || !newAmount) return;

    try {
      await axios.post(`/expenses/${id}`, {
        desc: newDesc,
        amount: newAmount,
        paidBy: newPayer // The real user ID of the payer
      });
      setNewDesc('');
      setNewAmount('');
      setShowAddForm(false);
      fetchExpenses(); // Re-fetch to update settlements
    } catch (error) {
      console.error('Failed to add expense', error);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await axios.delete(`/expenses/expense/${expenseId}`);
      fetchExpenses();
    } catch (error) {
      console.error('Failed to delete expense', error);
    }
  };

  const totalSpend = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="flex flex-col h-[85vh]">
      {/* Sub Navigation */}
      <div className="flex gap-4 mb-4 border-b border-slate-200 pb-4">
        <Link to={`/planner/${id}`} className="font-medium text-slate-500 hover:text-slate-800">Itinerary</Link>
        <Link to={`/expenses/${id}`} className="font-semibold text-primary-600 border-b-2 border-primary-600 pb-1">Expenses</Link>
        <Link to={`/chat/${id}`} className="font-medium text-slate-500 hover:text-slate-800">Chat & Docs</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Left Col: Overview & Add Expense */}
        <div className="col-span-2 flex flex-col gap-6 overflow-y-auto">
          <div className="glass-card p-6 flex justify-between items-center bg-gradient-to-r from-primary-600 to-indigo-600 text-white">
            <div>
              <h2 className="text-xl font-medium opacity-90">Total Group Trip Spend</h2>
              <p className="text-4xl font-bold flex items-center mt-2"><IndianRupee className="h-8 w-8" /> {totalSpend}</p>
            </div>
            <button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-white text-primary-600 px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-50"
            >
              <Plus className="h-5 w-5" /> {showAddForm ? 'Cancel' : 'Add Expense'}
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddExpense} className="p-4 border border-primary-200 bg-primary-50 rounded-xl space-y-3">
              <input type="text" placeholder="Expense Description" value={newDesc} onChange={e => setNewDesc(e.target.value)} className="w-full p-2 border border-slate-200 rounded outline-none focus:border-primary-500" required />
              <input type="number" placeholder="Amount (₹)" value={newAmount} onChange={e => setNewAmount(e.target.value)} className="w-full p-2 border border-slate-200 rounded outline-none focus:border-primary-500" required />
              <select value={newPayer} onChange={e => setNewPayer(e.target.value)} className="w-full p-2 border border-slate-200 rounded outline-none focus:border-primary-500">
                {groupMembers.map(member => (
                  <option key={member._id} value={member._id}>
                    {member._id === user?._id ? 'I paid' : `${member.name} paid`}
                  </option>
                ))}
              </select>
              <button type="submit" className="w-full bg-primary-600 text-white font-medium py-2 rounded hover:bg-primary-700 transition-colors">Save Expense</button>
            </form>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex-1">
            <h3 className="text-xl font-bold mb-4">Recent Expenses</h3>
            {expenses.length === 0 ? <p className="text-slate-500">No expenses added yet.</p> : (
            <div className="space-y-4">
              {expenses.map((exp, idx) => (
                <div key={idx} className="group flex justify-between items-center p-4 border border-slate-100 rounded-xl hover:bg-slate-50 relative">
                  <div className="flex gap-4 items-center">
                    <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 uppercase">
                      {exp.paidBy?.name ? exp.paidBy.name[0] : 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{exp.description}</p>
                      <p className="text-sm text-slate-500">{exp.paidBy?.name || 'User'} paid • {new Date(exp.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-bold text-lg flex items-center"><IndianRupee className="h-4 w-4" />{exp.amount}</p>
                    <button 
                      onClick={() => handleDeleteExpense(exp._id)}
                      className="p-1.5 text-slate-300 hover:bg-red-50 hover:text-red-500 rounded transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        </div>

        {/* Right Col: Settlements */}
        <div className="col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 overflow-y-auto">
          <div className="flex items-center gap-2 mb-6">
            <PieChart className="h-6 w-6 text-primary-600" />
            <h3 className="text-xl font-bold">Settlements</h3>
          </div>
          
          <div className="p-4 bg-orange-50 text-orange-800 rounded-xl mb-6 text-sm flex items-start gap-2 border border-orange-100">
            <ArrowRightLeft className="h-5 w-5 shrink-0" />
            <p>These are the optimized transfers to settle all debts in the group.</p>
          </div>

          <div className="space-y-4">
            {splits.length === 0 ? <p className="text-slate-500 text-sm">All settled up!</p> : splits.map((split, idx) => (
              <div key={idx} className="flex flex-col gap-2 p-4 border border-slate-100 rounded-xl">
                <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                  <span>{split.from?.name || 'User A'}</span>
                  <ArrowRightLeft className="h-4 w-4 text-slate-400" />
                  <span>{split.to?.name || 'User B'}</span>
                </div>
                <div className="flex justify-center">
                  <span className="font-bold text-lg flex items-center text-slate-800">
                    <IndianRupee className="h-5 w-5" /> {split.amount}
                  </span>
                </div>
                <button className="w-full mt-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm transition-colors">
                  Settle Up
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Expenses;
