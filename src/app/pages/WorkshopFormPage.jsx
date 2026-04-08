import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";
import PageIntro from "../components/PageIntro";
import { fetchWorkshopById } from "../services/api";

const defaultForm = {
  title: "",
  category: "AI & Emerging Tech",
  date: "",
  time: "",
  description: "",
  seatsAvailable: 20,
  price: "$99",
};

function WorkshopFormPage() {
  const { workshopId } = useParams();
  const isEditMode = Boolean(workshopId);
  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    if (!workshopId) {
      setForm(defaultForm);
      return;
    }

    let isMounted = true;

    const loadWorkshop = async () => {
      try {
        const workshop = await fetchWorkshopById(workshopId);

        if (isMounted) {
          setForm({
            ...defaultForm,
            ...workshop,
          });
        }
      } catch (error) {
        toast.error("Failed to load workshop details.");
      }
    };

    loadWorkshop();

    return () => {
      isMounted = false;
    };
  }, [workshopId]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    toast.success(
      isEditMode ? "Workshop changes saved locally." : "Workshop drafted."
    );
  };

  return (
    <div className="container">
      <PageIntro
        eyebrow={isEditMode ? "Edit workshop" : "Add workshop"}
        title={
          isEditMode
            ? "Refine workshop details before publishing the next cohort."
            : "Create a fresh workshop experience for your learners."
        }
        description="This frontend-only form shows how a polished workshop creation flow could look inside the admin workspace."
      />

      <form className="dashboard-card" onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="title">Workshop title</label>
            <input className="input" id="title" name="title" onChange={handleChange} value={form.title} />
          </div>
          <div className="form-field">
            <label htmlFor="category">Category</label>
            <input className="input" id="category" name="category" onChange={handleChange} value={form.category} />
          </div>
          <div className="form-field">
            <label htmlFor="date">Date</label>
            <input className="input" id="date" name="date" onChange={handleChange} value={form.date} />
          </div>
          <div className="form-field">
            <label htmlFor="time">Time</label>
            <input className="input" id="time" name="time" onChange={handleChange} value={form.time} />
          </div>
          <div className="form-field">
            <label htmlFor="seatsAvailable">Available seats</label>
            <input className="input" id="seatsAvailable" name="seatsAvailable" onChange={handleChange} value={form.seatsAvailable} />
          </div>
          <div className="form-field">
            <label htmlFor="price">Price</label>
            <input className="input" id="price" name="price" onChange={handleChange} value={form.price} />
          </div>
        </div>
        <div className="form-field" style={{ marginTop: "1rem" }}>
          <label htmlFor="description">Description</label>
          <textarea className="textarea" id="description" name="description" onChange={handleChange} value={form.description} />
        </div>
        <button className="button button-primary" style={{ marginTop: "1rem" }} type="submit">
          {isEditMode ? "Save changes" : "Create workshop"}
        </button>
      </form>
    </div>
  );
}

export default WorkshopFormPage;
