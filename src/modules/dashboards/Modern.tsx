import userImg from '../../assets/images/profile/user-11.png';
import supportImg from '../../assets/images/dashboard/customer-support-img.png';

const Moderndash = () => {
    const name = localStorage.getItem('name') || 'User';
    return (
        <>
            <div className="grid grid-cols-12 gap-6">
                <div className="col-span-12">
                    <div className="relative flex items-center justify-between bg-primary/10 rounded-lg p-6">
                        <div className="flex items-center gap-3">
                            <div>
                                <img src={userImg} alt="user-img" width={70} height={70} className="rounded-full" />
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <h5 className="card-title">Welcome back! {name} 👋</h5>
                            </div>
                        </div>

                        {/* Support Image */}
                        <div className="hidden sm:block absolute right-8 bottom-0">
                            <img src={supportImg} alt="support-img" width={145} height={95} />
                        </div>
                    </div>
                </div>

                {/* <button onClick={() => toast.info('Saved successfully!')}>
                    Toast
                </button> */}

            </div>

        </>
    );
};

export default Moderndash;